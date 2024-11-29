# SOMson
Interactive sonification of self-organizing maps

Kohonen Maps, aka. self-organizing maps (SOMs) are neural networks that visualize a high-dimensional feature space on a low-dimensional map. While SOMs are an excellent tool for data examination and exploration, they inherently cause a loss of detail. Visualizations of the underlying data do not integrate well and, therefore, fail to provide an overall picture. Consequently, we suggest SOMson, an interactive sonification of the underlying data, as a data augmentation technique. The sonification increases the amount of information provided simultaneously by the SOM.

Explore the sonification at https://simon-linke.github.io/SOMson/


An in-depth explanation can be found in the associated publication:

Linke, S. & Ziemer, T. (2024). SOMson - Sonification of Multidimensional Data in Kohonen Maps. In Proceedings of the 29th International Conference on Auditory Display (ICAD2024) (pp. 50–57). ICAD 2024: The 29th International Conference on Auditory Display. International Community for Auditory Display. https://doi.org/10.21785/icad2024.008


## Dependencies
This project uses p5.sound (https://github.com/processing/p5.js-sound) for sound synthesis. Further, for proper display, js-colormaps (https://github.com/timothygebhard/js-colormaps) and jQuery (https://github.com/jquery/jquery) are used.
