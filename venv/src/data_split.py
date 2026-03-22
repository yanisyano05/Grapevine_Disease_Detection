"""
@autour: Jhodi Avizara
"""
import os
import splitfolders

current_dir = os.getcwd()
data_dir = current_dir[:-9]+"/data/raw/"
splitfolders.ratio(data_dir, output=current_dir[:-9]+"/data/datasplit/", seed=1337, ratio=(.8, 0.1,0.1)) 

