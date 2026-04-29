import os
import matplotlib.pyplot as plt
import PIL
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential
from tensorflow.keras.callbacks import EarlyStopping

current_dir = os.getcwd()

# Constantes 
BATCH_SIZE = 32
IMG_HEIGHT = 224
IMG_WIDTH = 224
CHANNELS = 3
EPOCHS = 100
NUM_CLASSES = 4
LEARNING_RATE = 0.001  

#Data augmentation 
data_augmentation = keras.Sequential(
  [
    layers.RandomFlip("horizontal_and_vertical",
                      input_shape=(IMG_HEIGHT,
                                  IMG_WIDTH,
                                  3)),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.1),
    layers.Rescaling(1./255)
  ]
)

# Auto Stop
early_stopping = EarlyStopping(monitor="val_loss", min_delta=0.2, patience=10)

# Model
model = Sequential()
# model.add(data_augmentation)
model.add(tf.keras.applications.MobileNetV2(input_shape=(IMG_HEIGHT,IMG_WIDTH,CHANNELS),
                         include_top=False, weights='imagenet'))
model.add(tf.keras.layers.GlobalAveragePooling2D())
model.add(tf.keras.layers.Dense(100, activation='relu'))
model.add(tf.keras.layers.Dense(100, activation='relu'))
model.add(tf.keras.layers.Dense(NUM_CLASSES, activation='softmax'))

optimizer = tf.keras.optimizers.Adam(learning_rate = LEARNING_RATE)

model.compile(optimizer=optimizer,
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

# Model 04
# TODO
