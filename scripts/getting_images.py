import os
import json
import time
from pathlib import Path
import requests
from duckduckgo_search import DDGS

def download_image(img_url, filename):
    """Download image with proper headers"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        response = requests.get(img_url, headers=headers, stream=True, timeout=15)
        
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Error downloading {img_url}: {str(e)}")
    return False

def get_first_image_url(query):
    """Get first image URL from DuckDuckGo"""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(f"{query} recipe", max_results=1))
            if results:
                return results[0]['image']
    except Exception as e:
        print(f"Search error: {str(e)}")
    return None

def process_recipes():
    # Get paths relative to script location
    script_dir = Path(__file__).parent
    parent_dir = script_dir.parent
    data_path = parent_dir / "data" / "recipes.json"
    img_dir = parent_dir / "data" / "img"
    
    # Create image directory if needed
    img_dir.mkdir(exist_ok=True)

    # Load recipe data
    with open(data_path) as f:
        data = json.load(f)
    
    recipes = data['payload']['data']
    total = len(recipes)
    processed = 0
    skipped = 0
    failed = 0
    downloaded = 0

    print(f"Starting image download for {total} recipes...\n")

    for index, recipe in enumerate(recipes, 1):
        recipe_index = recipe['Recipe_index']
        recipe_title = recipe['Recipe_title']
        img_path = img_dir / f"{recipe_index}.jpg"
        remaining = total - index
        
        if img_path.exists():
            print(f"[{index}/{total}] Remaining: {remaining} | Skipping {recipe_index}")
            skipped += 1
            continue
        
        print(f"[{index}/{total}] Remaining: {remaining} | Processing {recipe_index}: {recipe_title}")
        
        try:
            # Search for images
            image_url = get_first_image_url(recipe_title)
            
            if image_url:
                print(f"   Found image: {image_url}")
                if download_image(image_url, img_path):
                    print(f"   Saved {img_path.name}")
                    downloaded += 1
                else:
                    print("   Download failed")
                    failed += 1
            else:
                print("   No image found")
                failed += 1
            
        except Exception as e:
            print(f"   Error: {str(e)}")
            failed += 1
        
        processed += 1
        time.sleep(3)

    print("\nProcess completed!")
    print(f"Total processed: {processed}")
    print(f"Successfully downloaded: {downloaded}")
    print(f"Skipped (already existed): {skipped}")
    print(f"Failed downloads: {failed}")

if __name__ == '__main__':
    process_recipes()