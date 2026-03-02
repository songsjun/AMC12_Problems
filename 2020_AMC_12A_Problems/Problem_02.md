# 2020 AMC 12A Problem 2

## Problem
The acronym AMC is shown in the rectangular grid below with grid lines spaced 1 unit apart. In units, what is the sum of the lengths of the line segments that form the acronym AMC?


> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; unitsize(25); for (int $i = 0$; i < 3; ++i) { for (int $j = 0$; j < 9; ++j) { pair A = (j,i); } } for (int $i = 0$; i < 3; ++i) { for (int $j = 0$; j < 9; ++j) { if (j != 8) { draw((j,i)--($j+1$,i), dashed); } if (i != 2) { draw((j,i)--(j,$i+1$), dashed); } } } draw((0,0)--(2,2),linewidth(2)); draw((2,0)--(2,2),linewidth(2)); draw((1,1)--(2,1),linewidth(2)); draw((3,0)--(3,2),linewidth(2)); draw((5,0)--(5,2),linewidth(2)); draw((4,1)--(3,2),linewidth(2)); draw((4,1)--(5,2),linewidth(2)); draw((6,0)--(8,0),linewidth(2)); draw((6,2)--(8,2),linewidth(2)); draw((6,0)--(6,2),linewidth(2));
```


$\textbf{(A) } 17 \qquad \textbf{(B) } 15 + 2\sqrt{2} \qquad \textbf{(C) } 13 + 4\sqrt{2} \qquad \textbf{(D) } 11 + 6\sqrt{2} \qquad \textbf{(E) } 21$
## Solution 1
Each of the straight line segments have length 1 and each of the slanted line segments have length $\sqrt{2} (t$his can be deducted using 45-45-90, pythag, trig, or just sense)

There area a total of 13 straight lines segments and 4 slanted line segments. The sum is $\boxed{\textbf{(C) } 13 + 4\sqrt{2}}$

*~quacker88*
## Solution 2
Either count the straight or diagonals and deduce from the answers that the only answer possible is $\boxed{\textbf{(C) } 13 + 4\sqrt{2}}.$
## Video Solution
https://youtu.be/qJF3G7_IDgc

*~IceMatrix*
## Video Solution
https://youtu.be/vtCOv0kxuNE

*~Education, the Study of Everything*
## See Also
