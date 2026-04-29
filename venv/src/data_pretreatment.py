import os
import matplotlib.pyplot as plt
import PIL
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential

from models import BATCH_SIZE, IMG_HEIGHT, IMG_WIDTH, CHANNELS, EPOCHS

current_dir = os.getcwd()
data_dir = current_dir[:-9]+"/data/train/"

train_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="training",
  seed=123,
  image_size= (IMG_HEIGHT, IMG_WIDTH),
  batch_size= BATCH_SIZE, 
  shuffle=True)

val_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="validation",
  seed=123,
  image_size=(IMG_HEIGHT, IMG_WIDTH),
  batch_size= BATCH_SIZE, 
  shuffle=True)

test_ds = tf.keras.utils.image_dataset_from_directory(
  current_dir[:-9]+"/data/test/",
  seed=123,
  image_size=(IMG_HEIGHT, IMG_WIDTH),
  batch_size= BATCH_SIZE, 
  shuffle=True)
  
class_names = train_ds.class_names


# Configure for Performance
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# Pretreatment
normalization_layer = layers.Rescaling(1./255)

## train
normalized_train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
image_batch_train, labels_batch_train = next(iter(normalized_train_ds))

## val
normalized_val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))
image_batch_val, labels_batch_val = next(iter(normalized_val_ds))

## test
normalized_test_ds = test_ds.map(lambda x, y: (normalization_layer(x), y))
image_batch_test, labels_batch_test = next(iter(normalized_test_ds))

first_image = image_batch_train[0]

# Images name tensors
img_name_tensors = {}
for images, labels in test_ds:
    for i, class_name in enumerate(class_names):
        class_idx = class_names.index(class_name)
        mask = labels == class_idx
        
        if tf.reduce_any(mask):
            img_name_tensors[class_name] = images[mask][0] / 255.0
