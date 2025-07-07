import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


# Create DataFrame
df = pd.read_csv('Bangalore_Localities_Analysis.csv')

# Convert 'Industries Present' to numerical (Y = 1, N = 0)
df['Industries Present'] = df['Industries Present (Y/N)'].map({'Y': 1, 'N': 0})

# Drop unnecessary columns for clustering
X = df.drop(columns=['Place', 'Latitude', 'Longitude', 'Industries Present (Y/N)'])

# Standardize the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# KMeans clustering into 3 clusters
kmeans = KMeans(n_clusters=3, random_state=0)
df['Cluster'] = kmeans.fit_predict(X_scaled)

# Map clusters to labels manually based on characteristics
# You can inspect the cluster centers or average values per cluster to assign proper colors
cluster_labels = {
    0: 'Red Zone',
    1: 'Yellow Zone',
    2: 'Green Zone'
}

# This mapping might change based on actual results – check once visually
df['Zone'] = df['Cluster'].map(cluster_labels)

# Display result
print(df[['Place', 'Zone']])


# Save the DataFrame with cluster labels to a CSV file
df.to_csv('clustered_locations.csv')
