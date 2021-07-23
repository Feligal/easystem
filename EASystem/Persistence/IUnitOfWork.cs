using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Persistence
{
    public interface IUnitOfWork
    {
        Task CompletionAsync();
        AppDbContext GetAppDbContext();
    }
}
