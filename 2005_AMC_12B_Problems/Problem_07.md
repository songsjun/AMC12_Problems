# 2005 AMC 12B Problem 7

## Problem
What is the area enclosed by the graph of |$3x$|+|$4y$|=12?


$$\mathrm{(A)}\ 6 \qquad \mathrm{(B)}\ 12 \qquad \mathrm{(C)}\ 16 \qquad \mathrm{(D)}\ 24 \qquad \mathrm{(E)}\ 25$$

## Solution 1
If we get rid of the absolute values, we are left with the following 4 equations (using the logic that if |a|=b, then a is either b or -b):


$$
\begin{align*} 3x+4y=12 \\ -3x+4y=12 \\ 3x-4y=12 \\ -3x-4y=12 \end{align*}
$$


We can then put these equations in slope-intercept form in order to graph them.


$$
\begin{align*} 3x+4y=12 \,\implies\, y=-\dfrac{3}{4}x+3\\ -3x+4y=12\,\implies\, y=\dfrac{3}{4}x+3\\ 3x-4y=12\,\implies\, y=\dfrac{3}{4}x-3\\ -3x-4y=12\,\implies\, y=-\dfrac{3}{4}x-3\end{align*}
$$


Now you can graph the lines to find the shape of the graph:


> [Asymptote diagram - not rendered in Markdown]

```asy
Label f; f.p=fontsize(6); xaxis(-8,8,Ticks(f, 4.0)); yaxis(-6,6,Ticks(f, 3.0)); fill((0,-3)--(4,0)--(0,3)--(-4,0)--cycle,grey); draw((-4,-6)--(8,3), Arrows(4)); draw((4,-6)--(-8,3), Arrows(4)); draw((-4,6)--(8,-3), Arrows(4)); draw((4,6)--(-8,-3), Arrows(4));
```


We can easily see that it is a rhombus with diagonals of 6 and 8. The area is $\dfrac{1}{2}\times 6\times8,$ or $\boxed{\mathrm{(D)}\ 24}$
## Solution 2
You can also assign x and y to be 0. Then you can easily see that the diagonals are 6 and 8. Multiply and divide by 2 to get D. 24
## Solution 3
The graph is symmetric with respect to both coordinate axes, and in the first quadrant it coincides with the graph of the line $3x+4y = 12$. Therefore the region is a rhombus, and the area is

$\text{Area} = 4\left(\frac{1}{2}(4\cdot 3)\right) = 24 \rightarrow \boxed{D}$


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-5,0)--(5,0),Arrow); draw((0,-4)--(0,4),Arrow); label("$x$",(5,0),S); label("$y$",(0,4),E); label("4",(4,0),S); label("-4",(-4,0),S); label("3",(0,3),NW); label("-3",(0,-3),SW); draw((4,0)--(0,3)--(-4,0)--(0,-3)--cycle,linewidth(0.7));
```


*~Alcumus*
## See also
