import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from pathlib import Path

def main():
    # Load the data
    print("Loading scheme data...")
    df = pd.read_parquet("scheme_embed_docs.parquet")
    
    # Verify required columns exist
    if 'embed_doc' not in df.columns:
        raise ValueError("Input file must contain an 'embed_doc' column")
    if 'scheme_id' not in df.columns:
        raise ValueError("Input file must contain a 'scheme_id' column")
    
    # Initialize the model
    print("Loading sentence transformer model...")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    
    # Compute embeddings
    print("Computing embeddings (this may take a while)...")
    embed_docs = df['embed_doc'].tolist()
    embeddings = model.encode(
        embed_docs,
        convert_to_numpy=True,
        normalize_embeddings=True  # This does L2 normalization
    )
    
    # Get scheme IDs in the same order
    # Force scheme_ids to a fixed-width unicode dtype to avoid pickle issues
    scheme_ids = df['scheme_id'].astype(str).values.astype("U")
    
    # Create faiss_index directory if it doesn't exist
    Path("faiss_index").mkdir(exist_ok=True)
    
    # Save the results in the faiss_index directory
    print("Saving results...")
    np.save("faiss_index/scheme_embeddings.npy", embeddings.astype(np.float32))
    np.save("faiss_index/scheme_ids.npy", scheme_ids)
    
    # Print shapes
    print("\nResults saved successfully:")
    print(f"Embeddings shape: {embeddings.shape} (num_schemes × embedding_dim)")
    print(f"Scheme IDs shape: {scheme_ids.shape}")

if __name__ == "__main__":
    main()