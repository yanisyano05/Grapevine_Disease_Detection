import os
import matplotlib.pyplot as plt
import numpy as np

from data_pretreat import train_ds

# Configuration
data_dir = os.getcwd()[:-9] + "/data/"
class_names = ['Black Rot', 'ESCA', 'Healthy', 'Leaf Blight']
subsets = [dir_ for dir_ in os.listdir(data_dir)]

class_counts = {subset: {class_name: 0 for class_name in class_names} for subset in subsets}

for subset in subsets:
    subset_path = os.path.join(data_dir, subset)
    
    for class_name in class_names:
        class_path = os.path.join(subset_path, class_name)
        
        if os.path.isdir(class_path):
            images = [f for f in os.listdir(class_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            class_counts[subset][class_name] = len(images)

print("=" * 60)
print("NB OF CLASSES PER SUBSET")
print("=" * 60)

total_lst = []
for idx, subset in enumerate(subsets):
    print(f"\n{subset.upper()}:")
    total_lst.append(sum(class_counts[subset].values()))
    for class_name in class_names:
        count = class_counts[subset][class_name]
        percentage = (count / total_lst[idx] * 100) if total_lst[idx] > 0 else 0
        print(f"  {class_name}: {count} images ({percentage:.1f}%)")
    print(f"  Total: {total_lst[idx]} images")

fig, axes = plt.subplots(1, len(subsets), figsize=(15, 5))

for idx, subset in enumerate(subsets):
    counts = [class_counts[subset][class_name] for class_name in class_names]
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
    
    bars = axes[idx].bar(class_names, counts, color=colors, edgecolor='black', linewidth=1.5)

    for bar in bars:
        height = bar.get_height()
        axes[idx].text(bar.get_x() + bar.get_width()/2., height,
                      f'{int(height)}',
                      ha='center', va='bottom', fontweight='bold')
    
    axes[idx].set_title(subset.upper()+" tot: "+str(total_lst[idx]), fontsize=12, fontweight='bold')
    axes[idx].set_ylabel('Number of images', fontsize=10)
    axes[idx].set_xlabel('Classes', fontsize=10)
    axes[idx].tick_params(axis='x', rotation=45)
    axes[idx].grid(axis='y', alpha=0.3, linestyle='--')

plt.tight_layout()
plt.show()

# Load examples

for img, lbl in train_ds.take(1):
    for i in range(4):
        ax = plt.subplot(2, 2, i + 1)
        plt.imshow(img[i].numpy().astype("uint8"))
        plt.title(class_names[lbl[i]])
        plt.axis("off")
plt.show()
