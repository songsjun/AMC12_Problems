# 2009 AMC 12A Problem 8

> This problem is the same as [2009 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2009_AMC_12A_Problems) and [2009 AMC 10A #14](https://artofproblemsolving.com/wiki/index.php/2009_AMC_10A_Problems).
## Problem
Four congruent rectangles are placed as shown. The area of the outer square is 4 times that of the inner square. What is the ratio of the length of the longer side of each rectangle to the length of its shorter side?

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(6mm); defaultpen(linewidth(.8pt)); path p=(1,1)--(-2,1)--(-2,2)--(1,2); draw(p); draw(rotate(90)*p); draw(rotate(180)*p); draw(rotate(270)*p);
```


$\textbf{(A)}\ 3 \qquad \textbf{(B)}\ \sqrt {10} \qquad \textbf{(C)}\ 2 + \sqrt2 \qquad \textbf{(D)}\ 2\sqrt3 \qquad \textbf{(E)}\ 4$
## Solution 1
The area of the outer square is 4 times that of the inner square.
Therefore the side of the outer square is $\sqrt 4 = 2$ times that of the inner square.

Then the shorter side of the rectangle is 1/4 of the side of the outer square, and the longer side of the rectangle is 3/4 of the side of the outer square, hence their ratio is $\boxed{3}.$
## Solution 2
Let the side length of the smaller square be 1, and let the smaller side of the rectangles be y. Since the larger square's area is four times larger than the smaller square's, the larger square's side length is 2. 2 is equivalent to $2y+1$, giving $y=1/2$. Then, the longer side of the rectangles is 3/2. $\frac{\frac{3}{2}}{\frac{1}{2}}=\boxed{3}.$
## Solution 3
Let the longer side length be x, and the shorter side be a.

We have that $(x+a)^2=4(x-a)^2\implies$ x+$a=2(x-a)\implies$ x+a=2x-$2a\impliesx=3a\implies \frac{x}{a}=3$

Hence, the answer is $\boxed{A}\implies 3$
## Solution 4
WLOG, let the shorter side of the rectangle be 1, and the longer side be x . Thus, the area of the larger square is $(1+x)^2 .$ The area of the smaller square is $(x-1)^2$ . Thus, we have the equation $(1+x)^2 = $4 (x-2)^2$$ . Solving for x, we get $x = 3$ .

*~coolmath2017*
## See Also
