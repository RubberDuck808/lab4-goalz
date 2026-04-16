<<<<<<<< HEAD:backend/Goalz/Goalz.Core/Services/AuthService.cs
﻿using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
========
﻿using Goalz.Infrastructure.Data;
using Goalz.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Application.Services
>>>>>>>> dev:backend/Goalz/Goalz.Application/Services/AuthService.cs
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;

        public AuthService(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<LoginRequest> CheckAuth(string email, string password)
        {
            // Look for the user in the real database
            var user = await _authRepository.GetUserByEmail(email);

            if (user != null)
            {
                LoginRequest result = new LoginRequest();
                result.Email = user.Email;
                result.Name = user.Name;

                // Verify provided password against the hash stored in DB
                bool isverify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

                if (isverify) 
                { 
                    return result; 
                }
            }

            return null;
        }
    }
}