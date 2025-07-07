# Green Space Optimizer

**Green Space Optimizer** is a web-based tool designed to visualize, analyze, and recommend optimal green spaces across Bangalore. Using geospatial data and clustering algorithms, this platform empowers urban planners, researchers, and citizens to make informed decisions for sustainable city development.

---

## ✨ Features

* 📍 **Interactive Mapping**: Visualize localities using coloured map overlays and pollution hotspots.
* 🔬 **Data Clustering**: KMeans clustering applied on localities to identify green-deficient zones.
* 📈 **Pollution Analytics**: Integrated PM2.5-based pollution heatmap with location-level CSV data.
* 🏛 **Sunlight-Based Analysis**: Evaluate sunlight data for photosynthesis viability in green planning.
* 💻 **Modular Interface**: Individual dashboards for mapping, pollution, and sunlight factors.

---

## 🔧 Tech Stack

* **Frontend**: HTML, CSS, JS
* **Backend Scripts**: Python (for data processing and clustering)
* **Visualization**: GeoJSON, Leaflet.js, Matplotlib
* **Data**: CSVs with real Bangalore location data

---

## 📖 Structure Overview

```
Urban-Space/
├── mapping/               # Locality clustering & visualizations
├── pollution/             # PM2.5-based analysis with app.js
├── sunlight/              # Future scope: sunlight-based green scoring
├── index.html             # Project homepage
├── portal.html            # Dashboard portal
├── kmeans.py              # Core clustering logic
└── *.csv / *.txt          # Supporting datasets and summaries
```

---

## 🚀 How to Run

```bash
# Clone the repo
$ git clone https://github.com/Navya-Devv/Green-Space-Optimizer.git

# Navigate into modules like mapping/
$ open mapping/index.html  # or just drag into a browser
```

> ⚠️ Note: Some data-intensive views may require local hosting or lightweight servers.

---

## 📊 Use Cases

* Urban policy research
* Smart city dashboards
* Environmental impact studies
* Academic data science projects

---

## 📄 License

This project is open-sourced under the MIT License.

---

Made with ❤️ for sustainability.
