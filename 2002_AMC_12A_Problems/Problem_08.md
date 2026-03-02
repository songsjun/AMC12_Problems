# 2002 AMC 12A Problem 8

> This problem is the same as [2002 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12A_Problems) and [2002 AMC 10A #8](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10A_Problems).
## Problem
Betsy designed a flag using blue triangles, small white squares, and a red center square, as shown. Let B be the total area of the blue triangles, W the total area of the white squares, and P the area of the red square. Which of the following is correct?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3mm); fill((-4,-4)--(-4,4)--(4,4)--(4,-4)--cycle,blue); fill((-2,-2)--(-2,2)--(2,2)--(2,-2)--cycle,red); path onewhite=(-3,3)--(-2,4)--(-1,3)--(-2,2)--(-3,3)--(-1,3)--(0,4)--(1,3)--(0,2)--(-1,3)--(1,3)--(2,4)--(3,3)--(2,2)--(1,3)--cycle; path divider=(-2,2)--(-3,3)--cycle; fill(onewhite,white); fill(rotate(90)*onewhite,white); fill(rotate(180)*onewhite,white); fill(rotate(270)*onewhite,white);
```


$\textbf{(A)}\ B = W \qquad \textbf{(B)}\ W = P \qquad \textbf{(C)}\ B = P \qquad \textbf{(D)}\ 3B = 2P \qquad \textbf{(E)}\ 2P = W$
## Solution
The blue that's touching the center red square makes up 8 triangles, or 4 squares. Each of the corners is 1 square and each of the edges is 1, totaling 12 squares. There are 12 white squares, thus we have $\boxed{B=W\Rightarrow \text{(A)}}.$
## Solution 2
Cut the pattern into 16 square regions and use symmetry.

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3mm); fill((-4,-4)--(-4,4)--(4,4)--(4,-4)--cycle,blue); fill((-2,-2)--(-2,2)--(2,2)--(2,-2)--cycle,red); path onewhite=(-3,3)--(-2,4)--(-1,3)--(-2,2)--(-3,3)--(-1,3)--(0,4)--(1,3)--(0,2)--(-1,3)--(1,3)--(2,4)--(3,3)--(2,2)--(1,3)--cycle; path divider=(-2,2)--(-3,3)--cycle; fill(onewhite,white); fill(rotate(90)*onewhite,white); fill(rotate(180)*onewhite,white); fill(rotate(270)*onewhite,white); draw((-4,-2)--(4,-2),black); draw((-4,0)--(4,0),black); draw((-4,2)--(4,2),black); draw((-2,-4)--(-2,4),black); draw((0,-4)--(0,4),black); draw((2,-4)--(2,4),black);
```


This clearly shows $\boxed{\textbf{(A) }B=W}.$
## Video Solution by Daily Dose of Math
https://youtu.be/25qXgtEKULA

*~Thesmartgreekmathdude*
## See Also
