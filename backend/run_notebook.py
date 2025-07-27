import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

with open("Waikane_Flood_Visuals.ipynb", encoding="utf-8") as f:
    nb = nbformat.read(f, as_version=4)

ep = ExecutePreprocessor(timeout=600)
ep.preprocess(nb)
