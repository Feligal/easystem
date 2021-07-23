using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Persistence
{
    public class UnitOfWork:IUnitOfWork
    {
        private readonly AppDbContext appDbContext;

        public UnitOfWork(AppDbContext identityDbContext)
        {
            appDbContext = identityDbContext;
        }

        public async Task CompletionAsync()
        {
            await appDbContext.SaveChangesAsync();
        }

        public AppDbContext GetAppDbContext()
        {
            return appDbContext;
        }
    }
}
