# 2019 AMC 12A Problem 13

## Problem
How many ways are there to paint each of the integers 2, 3, $\cdots$ , 9 either red, green, or blue so that each number has a different color from each of its proper divisors?

$\textbf{(A)}~144\qquad\textbf{(B)}~216\qquad\textbf{(C)}~256\qquad\textbf{(D)}~384\qquad\textbf{(E)}~432$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
/*Diagram by Technodoggo 2 November 2024*/ import graph; unitsize(2cm); draw((-1,0)--(0,0),Arrow(15)); draw((-0.5,-0.866)--(-1,0),Arrow(15)); draw((-0.5,-0.866)--(0,0),Arrow(15)); draw((0.5,-0.866)--(0,0),Arrow(15)); draw((0.5,-0.866)--(1,0),Arrow(15)); draw((1.5,-0.866)--(1,0),Arrow(15)); filldraw(circle((0,0),0.2),white);label("$2$",(0,0)); filldraw(circle((-1,0),0.2),white);label("$4$",(-1,0)); filldraw(circle((1,0),0.2),white);label("$3$",(1,0)); filldraw(circle((-0.5,-0.866),0.2),white);label("$8$",(-0.5,-0.866)); filldraw(circle((0.5,-0.866),0.2),white);label("$6$",(0.5,-0.866)); filldraw(circle((-0.5,0.866),0.2),white);label("$5$",(-0.5,0.866)); filldraw(circle((0.5,0.866),0.2),white);label("$7$",(0.5,0.866)); filldraw(circle((1.5,-0.866),0.2),white);label("$9$",(1.5,-0.866));
```


(Diagram by Technodoggo)
## Solution 1
The 5 and 7 can be painted with no restrictions because the set of integers does not contain a multiple or proper factor of 5 or 7. There are 3 ways to paint each, giving us $\underline{9}$ ways to paint both. The 2 is the most restrictive number. There are $\underline{3}$ ways to paint 2, but without loss of generality, let it be painted red. 4 cannot be the same color as 2 or 8, so there are $\underline{2}$ ways to paint 4, which automatically determines the color for 8. 6 cannot be painted red, so there are $\underline{2}$ ways to paint 6, but WLOG, let it be painted blue. There are $\underline{2}$ choices for the color for 3, which is either red or green in this case. Lastly, there are $\underline{2}$ ways to choose the color for 9.

$$9 \cdot 3 \cdot 2 \cdot 2 \cdot 2 \cdot 2 = \boxed{\textbf{(E) }432}.$$
## Solution 2
We note that the primes can be colored any of the 3 colors since they don't have any proper divisors other than 1, which is not in the list. Furthermore, 6 is the only number in the list that has 2 distinct prime factors (namely, 2 and 3), so we do casework on 6.

**Case 1**: 2 and 3 are the same color

In this case, we have 3 primes to choose the color for (2, 5, and 7). Afterwards, 4, 6, and 9 have two possible colors, which will determine the color of 8. Thus, there are $3^3\cdot 2^3=216$ possibilities here.

**Case 2**: 2 and 3 are different colors

In this case, we have 4 primes to color. Without loss of generality, we'll color the 2 first, then the 3. Then there are 3 color choices for 2,5,7, and 2 color choices for 3. This will determine the color of 6 as well. After that, we only need to choose the color for 4 and 9, which each have 2 choices. Thus, there are $3^3\cdot 2^3=216$ possibilities here as well.

Adding up gives $216+216=\boxed{\textbf{(E) }432}.$
## Solution 3
2,4,8 require different colors each, so there are 6 ways to color these.

5 and 7 can be any color, so there are $3\times 3$ ways to color these.

6 can have 2 colors once 2 is colored, and thus 3 also has 2 colors following 6, which leaves another 2 for 9.

All together: $6\times 3 \times 3 \times 2 \times 2 \times 2 = 432 \Rightarrow \boxed{E}.$
## See Also
