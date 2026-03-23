import os
from tensorflow.keras.models import load_model
from data_pretreat import img_height, img_width, channels 
import sys

def menu(dir_):
    print("Select a model:")
    for idx, dir_ in enumerate(dir_):
        print(f"({idx})\t{dir_}")

def select_model():
    # Verify if a model is present on all_model_dir
    while True:
        try:
            # all_model_dir = input("Model dir : ")
            all_model_dir = "/home/jhodi/bit/Python/Grapevine_Pathology_Detection/venv/models"
            model_found = 0
            for foldername, subfolders, filenames in os.walk(all_model_dir):
                    for filename in filenames:
                        if filename.endswith(".keras"):
                            model_found += 1
            if model_found == 0:
                print("No model found ! ")
            else: 
                print("Models found.")
                break
        except Exception as e:
            print(f"Something went wrong! {str(e)}")
            sys.exit()
    
    subdirectories = [name for name in os.listdir(all_model_dir) if os.path.isdir(os.path.join(all_model_dir, name))]
    # Let user make his choce
    while True:
        try:
            menu(subdirectories)
            selected_model = int(input("-> ")) 
            if 0 <= selected_model < len(subdirectories):
                break
            else:
                print("Invalid choice. Please choose a valid number.")
        except ValueError:
            print("That's not a valid number!")

    model_dir = os.path.join(all_model_dir, subdirectories[selected_model])
    
    model = load_model(os.path.join(model_dir, "model.keras" ))
    model.build([None, img_height, img_width, channels])
    model.summary()

    return model, model_dir
