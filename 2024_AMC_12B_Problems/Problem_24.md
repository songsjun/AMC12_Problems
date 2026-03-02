# 2024 AMC 12B Problem 24

## Problem 24
What is the number of ordered triples (a,b,c) of positive integers, with $a\leb\lec\le 9,$ such that there exists a (non-degenerate) triangle $\triangle ABC$ with an integer inradius for which a, b, and c are the lengths of the altitudes from A to $\overline{BC}, B$ to $\overline{AC},$ and C to $\overline{AB},$ respectively? (Recall that the inradius of a triangle is the radius of the largest possible circle that can be inscribed in the triangle.)

$\textbf{(A) }2\qquad \textbf{(B) }3\qquad \textbf{(C) }4\qquad \textbf{(D) }5\qquad \textbf{(E) }6\qquad$
## Solution 1
First we derive the relationship between the inradius of a triangle r, and its three altitudes a, b, c.
Using an area argument, we can get the following well known result
$$\left(\frac{AB+BC+AC}{2}\right)r=A$$
where AB, BC, AC are the side lengths of $\triangle ABC,$ and A is the triangle's area. Substituting A=$\frac{1}{2}\cdot AB\cdot$ c into the above we get
$$\frac{r}{c}=\frac{AB}{AB+BC+AC}$$
Similarly, we can get

$$
\frac{r}{b}=\frac{AC}{AB+BC+AC}
\frac{r}{a}=\frac{BC}{AB+BC+AC}
$$

Hence,

$$
\begin{align}\label{e1}
\frac{1}{r}=\frac{1}{a}+\frac{1}{b}+\frac{1}{c}
\end{align}
$$


Note that there exists a unique, non-degenerate triangle with altitudes a, b, c if and only if $\frac{1}{a}, \frac{1}{b}, \frac{1}{c}$ are the side lengths of a non-degenerate triangle, i.e., $\frac{1}{b}+\frac{1}{c}>\frac{1}{a}.$

With this in mind, it remains to find all positive integer solutions (r, a, b, c) to the above such that $\frac{1}{b}+\frac{1}{c}>\frac{1}{a},$ and $a\leb\lec\le 9.$ We do this by doing casework on the value of r.

Since r is a positive integer, $r\ge 1.$ Since $a\leb\lec\le 9, \frac{1}{r}\ge \frac{1}{3},$ so $r\le3.$ The only possible values for r are 1, 2, and 3.

Case 1: $r=1$

For this case, we can't have $a\ge 4,$ since $\frac{1}{a}+\frac{1}{b}+\frac{1}{c}$ would be too small. When $a=3$, we must have $b=c=3$. When $a\le2,$ we would have $\frac{1}{b}+\frac{1}{c}\le\frac{1}{a},$ which doesn't work. Hence this case only yields one valid solution (1, 3, 3, 3)

Case 2: $r=2$

For this case, we can't have $a\ge 7,$ for the same reason as in Case 1. When $a=6$, we must have $b=c=6$. When $a=5$, we must have $b=5, c=10$ or $b=10, c=5$. Regardless, 10 appears, so it is not a valid solution. When $a\le4, \frac{1}{b}+\frac{1}{c}\le\frac{1}{a}.$ Hence, this case also only yields one valid solution (2, 6, 6, 6)

Case 3: $r=3$

The only possible solution is (3, 9, 9, 9), and clearly it is a valid solution.

Hence the only valid solutions are (1, 3, 3, 3), (2, 6, 6, 6), (3, 9, 9, 9), and our answer is \fbox{$\textbf{(B) }3$}

*~tsun26*
## Solution 2 (cheese+does not actually work)
Note that some equilateral triangles with irrational side lengths will have rational altitudes and as a result, a rational inradius. Therefore, the ordered pairs (a, b, c)=(3, 3, 3), (a, b, c)=(6, 6, 6), and (a, b, c)=(9, 9, 9) yield integer inradii, and we can make an educated guess that the answer is \fbox{$\textbf{(B) }3$}
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=4x4EilBvIA8
## See also
