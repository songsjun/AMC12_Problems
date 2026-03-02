# 2018 AMC 12A Problem 15

> This problem is the same as [2018 AMC 10A #20](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_20) and [2018 AMC 12A #15](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_15).
## Problem
A scanning code consists of a $7 \times 7$ grid of squares, with some of its squares colored black and the rest colored white. There must be at least one square of each color in this grid of $49$ squares. A scanning code is called $\textit{symmetric}$ if its look does not change when the entire square is rotated by a multiple of $90 ^{\circ}$ counterclockwise around its center, nor when it is reflected across a line joining opposite corners or a line joining midpoints of opposite sides. What is the total number of possible symmetric scanning codes?

$\textbf{(A)} \text{ 510} \qquad \textbf{(B)} \text{ 1022} \qquad \textbf{(C)} \text{ 8190} \qquad \textbf{(D)} \text{ 8192} \qquad \textbf{(E)} \text{ 65,534}$
## Solution 1
Draw a $7 \times 7$ square.


$$\begin{tabular}{|c|c|c|c|c|c|c|}
$$\hline$$
K & J & H & G & H & J & K \\
$$\hline$$
J & F & E & D & E & F & J \\
$$\hline$$
H & E & C & B & C & E & H \\
$$\hline$$
G & D & B & A & B & D & G \\
$$\hline$$
H & E & C & B & C & E & H \\
$$\hline$$
J & F & E & D & E & F & J \\
$$\hline$$
K & J & H & G & H & J & K \\
$$\hline$$
$\end{tabular}$$$


Start from the center and label all protruding cells symmetrically. (Note that "I" is left out of this labelling, so there are only 10 labels, not 11, as ending in K would suggest!)

More specifically, since there are $4$ given lines of symmetry ($2$ diagonals, $1$ vertical, $1$ horizontal) and they split the plot into $8$ equivalent sections, we can take just one-eighth and study it in particular. Each of these sections has $10$ distinct sub-squares, whether partially or in full. So since each can be colored either white or black, we choose $2^{10}=1024$ but then subtract the $2$ cases where all are white or all are black. That leaves us with $\fbox{\textbf{(B)} \text{ 1022}}$.

There are only ten squares we get to actually choose, and two independent choices for each, for a total of $2^{10} = 1024$ codes. Two codes must be subtracted (due to the rule that there must be at least one square of each color) for an answer of $\fbox{\textbf{(B) }1022}$.


Note that this problem is very similar to the 1996 AIME Problem 7 https://artofproblemsolving.com/wiki/index.php/1996_AIME_Problems/Problem_7.
## Solution 2 (Very Intuitive and Fast)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(100pt);
draw((1,0)--(8,0),linewidth(0.5));
draw((1,2)--(6,2),linewidth(0.5));
draw((1,4)--(4,4),linewidth(0.5));
draw((1,6)--(2,6),linewidth(0.5));
draw((2,6)--(2,0),linewidth(0.5));
draw((4,4)--(4,0),linewidth(0.5));
draw((6,2)--(6,0),linewidth(0.5));
draw((1,0)--(1,7),dashed+linewidth(0.5));
draw((1,7)--(8,0),dashed+linewidth(0.5));
```

</asy>

Imagine folding the scanning code along its lines of symmetry. There will be $10$ regions which you have control over coloring. Since we must subtract off $2$ cases for the all-black and all-white cases, the answer is $2^{10}\boxed{\textbf{(B) } 1022.}$
## Solution 3
$$\begin{tabular}{|c|c|c|c|c|c|c|}
$$\hline$$
T & T & T & X & T & T & T \\
$$\hline$$
T & T & T & Y& T & T & T \\
$$\hline$$
T & T & T & Z & T & T & T \\
$$\hline$$
X & Y & Z & W & Z & Y & X \\
$$\hline$$
T & T & T & Z & T & T & T \\
$$\hline$$
T & T & T & Y & T & T & T \\
$$\hline$$
T & T & T & X & T & T & T \\
$$\hline$$
$\end{tabular}$$$


There are $3 \times 3$ squares in the corners of this $7 \times 7$ square, and there is a horizontal and vertical stripe through the middle. Because we need to have symmetry when the diagonals and midpoints of the large square is connected, we can create a table like this: (Different letters represent different color choices between black and white)


$$\begin{tabular}{|c|c|c|}
$$\hline$$
A & B & C \\
$$\hline$$
B & D & E \\
$$\hline$$
C & E & F \\
$$\hline$$
$\end{tabular}$$$


(Note that coloring one $3 \times 3$ square will also determine the colorings of the other $3$ because the large $7 \times 7$ square must look the same when it is rotated by $\circ$)

There are $6$ different letters and $2$ choices of color (black and white) for each letter, so there are $2^6=64$ colorings of a proper $3 \times 3$ square. Now, all that's left are the horizontal and vertical stripes. Using similar logic, we can see that there are $4$ different letters, so there are $2^4=16$ different colorings. Multiplying them together gives $16 \times 64 = 1024$. Going back to the question, we see that "there must be at least one square of each color in this grid of $49$ squares." We must then eliminate $2$ options: an all-black grid and an all-white grid. $1024-2= \boxed{\textbf{(B)} 1022} \\ \phantom{}$
*~hansenhe*
## Video Solution by Pi Academy
https://youtu.be/lDk1--vGCYc?si=lPYpCtBdfuec72Xm

*~Pi Academy*
## Video Solution 2
https://youtu.be/M22S82Am2zM

*~IceMatrix*
## See Also
