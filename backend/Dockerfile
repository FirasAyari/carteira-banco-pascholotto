FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY global.json ./
COPY PascholottoMvp.slnx ./
COPY src/Pascholotto.Domain/Pascholotto.Domain.csproj src/Pascholotto.Domain/
COPY src/Pascholotto.Application/Pascholotto.Application.csproj src/Pascholotto.Application/
COPY src/Pascholotto.Infrastructure/Pascholotto.Infrastructure.csproj src/Pascholotto.Infrastructure/
COPY src/Pascholotto.Api/Pascholotto.Api.csproj src/Pascholotto.Api/
COPY tests/Pascholotto.Application.Tests/Pascholotto.Application.Tests.csproj tests/Pascholotto.Application.Tests/

RUN dotnet restore PascholottoMvp.slnx

COPY src ./src
COPY tests ./tests

RUN dotnet publish src/Pascholotto.Api/Pascholotto.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Pascholotto.Api.dll"]
