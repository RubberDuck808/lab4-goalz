FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy all csproj files first for layer caching
COPY Goalz.API/Goalz.API.csproj ./Goalz.API/
COPY Goalz.Domain/Goalz.Domain.csproj ./Goalz.Domain/
COPY Goalz.Application/Goalz.Core.csproj ./Goalz.Application/
COPY Goalz.Data/Goalz.Data.csproj ./Goalz.Data/
COPY Goalz.Infrastructure/Goalz.Infrastructure.csproj ./Goalz.Infrastructure/
RUN dotnet restore ./Goalz.API/Goalz.API.csproj

COPY . .
RUN dotnet publish ./Goalz.API/Goalz.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Goalz.API.dll"]
