# TELECONNECTION // NASA Earth Trend Detective

An interactive Earth-observation web application built for the **NASA Space Apps Challenge ("Be An Earth System Trend Detective!")** that uncovers statistically significant inverse climate trends (*climate seesaws / dipoles*) between two geographic regions over a 20-year period (2005–2024).

## NASA Open Data Sources Used
* **NASA POWER API (`power.larc.nasa.gov`):** 20-year monthly time-series reanalysis data (MERRA-2 assimilation) for 2-Meter Temperature (`T2M`), Corrected Precipitation (`PRECTOTCORR`), Surface Soil Wetness (`GWETTOP`), and All-Sky Shortwave Solar Irradiance (`ALLSKY_SFC_SW_DWN`).
* **NASA GIBS WMTS (`gibs.earthdata.nasa.gov`):** Live satellite map tile streaming (`MODIS_Terra_CorrectedReflectance_TrueColor` and `MODIS_Terra_Aerosol`) with an interactive 2005–2024 temporal comparison slider.

## Statistical Methodology
* **Ordinary Least Squares (OLS) Linear Regression:** Computes decadal rate of change (`slope / decade`) and coefficient of determination ($R^2$) independently for Location A and Location B.
* **Two-Tailed Student's $t$-Test:** Evaluates the standard error of the regression slope ($df = n - 2$) to verify statistical significance ($p < 0.05$).
* **Pearson Cross-Correlation ($r$):** Quantifies inverse synchronization ($r < -0.5$ with opposing slope signs) between regions.

## Local Setup
```bash
npm install
npm run dev