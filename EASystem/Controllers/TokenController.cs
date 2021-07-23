
using EASystem.Models.AuthenticationModels;
using EASystem.Models.ViewModels;
using EASystem.Persistence;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace EASystem.Controllers
{
    public class TokenController:Controller
    {
        private readonly AppDbContext _dbContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _config;

        public TokenController(AppDbContext dbContext, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration config)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("/api/token/auth")]
        public async Task<IActionResult> Jwt([FromBody] TokenRequestViewModel model)
        {
            //return a generic HTTP Status 500 (Server Error)
            //if the client  payload is invalid
            if (model == null) return new StatusCodeResult(500);
            switch (model.GrantType)
            {
                case "password": return await GetToken(model);
                case "refreshToken": return await RefreshToken(model);
                default:
                    //not supported - return a HTTP 401 (Unauthorized)
                    return new UnauthorizedResult();
            }
        }


        private async Task<IActionResult> GetToken(TokenRequestViewModel model)
        {
            try
            {
                //Chech if there is a usert with a given username
                var user = await _userManager.FindByNameAsync(model.Username);
                //Fall back to support email address instead of username
                if (user == null && model.Username.Contains("@"))
                    user = await _userManager.FindByEmailAsync(model.Username);
                if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    //User does not exist or password mismatch
                    return new UnauthorizedResult();
                }
                //Username & password match: create the refresh token
                var rt = CreateRefreshToken(model.ClientId, user.Id);
                _dbContext.Tokens.Add(rt);
                await _dbContext.SaveChangesAsync();
                //Get user's role type
                var roleType = await _userManager.GetRolesAsync(user);
                //Create and return the access
                var accessToken = CreateAccessToken(user.Id, rt.Value, roleType, user.UserName);
                return new JsonResult(accessToken);
            }
            catch (Exception ex)
            {
                return new UnauthorizedResult();
            }
        }

        private async Task<IActionResult> RefreshToken(TokenRequestViewModel model)
        {
            try
            {
                var rt = _dbContext.Tokens
                    .FirstOrDefault(t => t.ClientId == model.ClientId && t.Value == model.RefreshToken);
                if (rt == null)
                {
                    //refresh token not found or invalid (or invalid clientId)
                    return new UnauthorizedResult();
                }
                //Check if there's a user with a refresh  token's userId
                var user = await _userManager.FindByIdAsync(rt.UserId);
                if (user == null)
                {
                    //UserId not found or invalid
                    return new UnauthorizedResult();
                }

                //generate a new refresh token 
                var rtNew = CreateRefreshToken(rt.ClientId, rt.UserId);
                //invalidate the old refresh token (by deleting it)
                _dbContext.Tokens.Remove(rt);
                //Add the new refresh token 
                _dbContext.Tokens.Add(rtNew);
                //Persist changes in the DB
                await _dbContext.SaveChangesAsync();
                //Get users's role role type
                AppUser currentUser = await _userManager.FindByIdAsync(rt.UserId);
                var roleType = await _userManager.GetRolesAsync(currentUser);
                //Create a new access token
                var response = CreateAccessToken(rtNew.UserId, rtNew.Value, roleType, currentUser.UserName);
                return new JsonResult(response);
            }
            catch (Exception ex)
            {
                return new UnauthorizedResult();
            }
        }

        private TokenResponseViewModel CreateAccessToken(string userId, string refreshToken, IList<string> roleTypes, string userName)
        {
            DateTime now = DateTime.UtcNow;
            //Add the registered claims for JWT
            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub,userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString()),
                new Claim(ClaimTypes.Name,userName)
            };
            foreach (var role in roleTypes)
            {
                claims = claims.Append(new Claim(ClaimTypes.Role, role)).ToArray();
            }
            var tokenExpirationMins = _config.GetValue<int>("Data:Auth:Jwt:TokenExpirationInMinutes");
            var issuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Data:Auth:Jwt:Key"]));
            var token = new JwtSecurityToken(
                issuer: _config["Data:Auth:Jwt:Issuer"],
                audience: _config["Data:Auth:Jwt:Audience"],
                claims: claims,
                notBefore: now,
                expires: now.Add(TimeSpan.FromMinutes(tokenExpirationMins)),
                signingCredentials: new SigningCredentials(issuerSigningKey, SecurityAlgorithms.HmacSha256)
            );
            var encodedToken = new JwtSecurityTokenHandler().WriteToken(token);
            //Build the json response
            return new TokenResponseViewModel()
            {
                Token = encodedToken,
                Expiration = tokenExpirationMins,
                RefreshToken = refreshToken
            };
        }

        private Token CreateRefreshToken(string clientId, string userId)
        {
            return new Token()
            {
                ClientId = clientId,
                UserId = userId,
                Type = 0,
                Value = Guid.NewGuid().ToString("N"),
                CreatedDate = DateTime.UtcNow
            };
        }
    }
}
