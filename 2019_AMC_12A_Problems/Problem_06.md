# 2019 AMC 12A Problem 6

> This problem is the same as [2019 AMC 10A #8](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #6](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
The figure below shows line $\ell$ with a regular, infinite, recurring pattern of squares and line segments.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(300);
defaultpen(linewidth(0.8));
real $r = 0.35$;
path P = (0,0)--(0,1)--(1,1)--(1,0), Q = (1,1)--(1+r,1+r);
path Pp = (0,0)--(0,-1)--(1,-1)--(1,0), Qp = (-1,-1)--(-1-r,-1-r);
```

for(int $i=$0;i <= 4;$i=i+1$)
{

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(shift((4*i,0)) * P);
draw(shift((4*i,0)) * Q);
```

}
for(int $i=$1;i <= 4;$i=i+1$)
{

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(shift((4*$i-2$,0)) * Pp);
draw(shift((4*$i-1$,0)) * Qp);
```

}

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1,0)--(18.5,0));
```

</asy>

How many of the following four kinds of rigid motion transformations of the plane in which this figure is drawn, other than the identity transformation, will transform this figure into itself?
*some rotation around a point of line $\ell$
*some translation in the direction parallel to line $\ell$
*the reflection across line $\ell$
*some reflection across a line perpendicular to line $\ell$

$\textbf{(A) } 0 \qquad\textbf{(B) } 1 \qquad\textbf{(C) } 2 \qquad\textbf{(D) } 3 \qquad\textbf{(E) } 4$
## Solution
Statement $1$ is true. A $180^{\circ}$ rotation about the point half way between an up-facing square and a down-facing square will yield the same figure.

Statement $2$ is also true. A translation to the left or right will place the image onto itself when the figures above and below the line realign (the figure goes on infinitely in both directions).

Statement $3$ is false. A reflection across line $\ell$ will change the up-facing squares to down-facing squares and vice versa.

Finally, statement $4$ is also false because it will cause the diagonal lines extending from the squares to switch direction.

Thus, $\fbox {\textbf{(C)}  2}$ statements are true.
## Video Solution 1
https://youtu.be/jOaLKb9Oack

Education, the Study of Everything
## See Also
