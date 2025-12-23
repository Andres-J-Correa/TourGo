
FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy AS base

# Install wkhtmltopdf dependencies and wkhtmltopdf
RUN apt update
RUN apt install -y libgdiplus
RUN ln -s /usr/lib/libgdiplus.so /lib/x86_64-linux-gnu/libgdiplus.so
RUN apt-get install -y --no-install-recommends zlib1g fontconfig libfreetype6 libx11-6 libxext6 libxrender1 wget gdebi
RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.jammy_amd64.deb
RUN gdebi --n wkhtmltox_0.12.6.1-3.jammy_amd64.deb
RUN ln -s /usr/local/lib/libwkhtmltox.so /usr/lib/libwkhtmltox.so

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