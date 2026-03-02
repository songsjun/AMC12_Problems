# 2011 AMC 12A Problem 2

## Problem
There are 5 coins placed flat on a table according to the figure. What is the order of the coins from top to bottom?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(100); defaultpen(linewidth(.8pt)+fontsize(8pt)); draw(arc((0,1), 1.2, 25, 214)); draw(arc((.951,.309), 1.2, 0, 360)); draw(arc((.588,-.809), 1.2, 132, 370)); draw(arc((-.588,-.809), 1.2, 75, 300)); draw(arc((-.951,.309), 1.2, 96, 228)); label("$A$",(0,1),NW); label("$B$",(-1.1,.309),NW); label("$C$",(.951,.309),E); label("$D$",(-.588,-.809),W); label("$E$",(.588,-.809),S);
```


$\textbf{(A)}\ (C, A, E, D, B) \qquad \textbf{(B)}\ (C, A, D, E, B) \qquad \textbf{(C)}\ (C, D, E, A, B) \qquad \textbf{(D)}\ (C, E, A, D, B) \qquad \textbf{(E)}\ (C, E, D, A, B)$
## Solution
By careful inspection and common sense, the answer is $\textbf{(E)}.$
## Note
Note that this image is quite similar to a topological map. This means that the coin that appears closest to us is at the top and the coin that appears farthest from us is at the bottom.
## See also
