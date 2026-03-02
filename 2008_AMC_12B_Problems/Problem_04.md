# 2008 AMC 12B Problem 4

## Problem
On circle O, points C and D are on the same side of diameter $\overline{AB}, \angle AOC = 30^\circ,$ and $\angle DOB = 45^\circ.$ What is the ratio of the area of the smaller sector COD to the area of the circle?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(6mm); defaultpen(linewidth(0.7)+fontsize(8pt)); pair C = 3*dir (30); pair D = 3*dir (135); pair A = 3*dir (0); pair B = 3*dir(180); pair O = (0,0); draw (Circle ((0, 0), 3)); label ("$C$", C, NE); label ("$D$", D, NW); label ("$B$", B, W); label ("$A$", A, E); label ("$O$", O, S); label ("$\circ$", (-0.3,0.1), WNW); label ("$\circ$", (0.5,0.1), ENE); draw (A--B); draw (O--D); draw (O--C);
```


$\textbf{(A)}\ \frac {2}{9} \qquad \textbf{(B)}\ \frac {1}{4} \qquad \textbf{(C)}\ \frac {5}{18} \qquad \textbf{(D)}\ \frac {7}{24} \qquad \textbf{(E)}\ \frac {3}{10}$
## Solution
$\angle COD = \angle AOB - \angle AOC - \angle BOD = 180^\circ - 30^\circ - 45^\circ = 105^\circ.$

Since a circle has $360^\circ,$ the desired ratio is $\frac{105^\circ}{360^\circ}=\frac{7}{24} \Rightarrow D.$
## See Also
