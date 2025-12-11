import numpy as np
import faiss
import json
import os
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def build_faiss_index():
    try:
        # Create faiss_index directory if it doesn't exist
        os.makedirs('faiss_index', exist_ok=True)
        
        # Load embeddings and IDs
        logger.info("Loading embeddings and IDs...")
        embeddings = np.load('faiss_index/scheme_embeddings.npy', allow_pickle=True)
        scheme_ids = np.load('faiss_index/scheme_ids.npy', allow_pickle=True)
        
        # Verify shapes
        if len(embeddings) != len(scheme_ids):
            raise ValueError(f"Mismatch in number of embeddings ({len(embeddings)}) and IDs ({len(scheme_ids)})")
        
        dim = embeddings.shape[1]
        logger.info(f"Loaded {len(embeddings)} embeddings with dimension {dim}")
        
        # Create and build the FAISS index
        logger.info("Building FAISS index...")
        index = faiss.IndexFlatIP(dim)  # Inner product (cosine similarity) index

        # Add vectors to the index
        index.add(embeddings)

        # Save the FAISS index to faiss_index directory
        index_file = Path('faiss_index/faiss_index.bin')
        faiss.write_index(index, str(index_file))

        # Save ID mapping in faiss_index directory
        id_map = {
            'index_to_id': scheme_ids.tolist(),
            'dimension': dim,
            'total_vectors': len(scheme_ids)
        }
        with open('faiss_index/faiss_id_map.json', 'w', encoding='utf-8') as f:
            json.dump(id_map, f, indent=2)

        logger.info(f"FAISS index saved to {index_file}")
        logger.info(f"Total vectors indexed: {index.ntotal}")
        logger.info(f"Index dimension: {dim}")
        
        return True
        
    except FileNotFoundError as e:
        logger.error(f"Required file not found: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return False

if __name__ == "__main__":
    # Check if FAISS is installed
    try:
        import faiss
    except ImportError:
        logger.error("FAISS not installed. Please install it with: pip install faiss-cpu (or faiss-gpu)")
        exit(1)
        
    build_faiss_index()
