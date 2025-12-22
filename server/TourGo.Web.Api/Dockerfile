
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 50002

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["global.json", "."]
COPY ["TourGo.sln", "."]

COPY ["TourGo.Web.Api/TourGo.Web.Api.csproj", "TourGo.Web.Api/"]
COPY ["TourGo.Data/TourGo.Data.csproj", "TourGo.Data/"]
COPY ["TourGo.Services/TourGo.Services.csproj", "TourGo.Services/"]
COPY ["TourGo.Models/TourGo.Models.csproj", "TourGo.Models/"]
COPY ["TourGo.Web.Core/TourGo.Web.Core.csproj", "TourGo.Web.Core/"]
COPY ["TourGo.Web.Models/TourGo.Web.Models.csproj", "TourGo.Web.Models/"]

RUN dotnet restore "TourGo.Web.Api/TourGo.Web.Api.csproj"
COPY . .
WORKDIR "/src/TourGo.Web.Api"
RUN dotnet build "TourGo.Web.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "TourGo.Web.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TourGo.Web.Api.dll"]