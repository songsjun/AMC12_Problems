# 2005 AMC 12A Problem 7

## Problem
Square EFGH is inside square ABCD so that each side of EFGH can be extended to pass through a vertex of ABCD. Square ABCD has side length $\sqrt{50}, E$ is between B and H, and BE = 1. What is the area of the inner square EFGH?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(4cm); defaultpen(linewidth(.8pt)+fontsize(10pt)); pair D=(0,0), C=(1,0), B=(1,1), A=(0,1); pair F=intersectionpoints(Circle(D,2/sqrt(5)),Circle(A,1))[0]; pair G=foot(A,D,F), H=foot(B,A,G), E=foot(C,B,H); draw(A--B--C--D--cycle); draw(D--F); draw(C--E); draw(B--H); draw(A--G); label("$A$",A,NW); label("$B$",B,NE); label("$C$",C,SE); label("$D$",D,SW); label("$E$",E,NNW); label("$F$",F,ENE); label("$G$",G,SSE); label("$H$",H,WSW);
```


$$(\mathrm {A}) \ 25 \qquad (\mathrm {B}) \ 32 \qquad (\mathrm {C})\ 36 \qquad (\mathrm {D}) \ 40 \qquad (\mathrm {E})\ 42$$

## Solution
[Image:2005_$12A_AMC-7b$.png](https://artofproblemsolving.com/wiki/index.php/Image:2005_12A_AMC-7b.png)

Arguable the hardest part of this question is to visualize the diagram. Since each side of EFGH can be extended to pass through a vertex of ABCD, we realize that EFGH must be tilted in such a fashion. Let a side of EFGH be x.

[Image:2005_$12A_AMC-7$.png](https://artofproblemsolving.com/wiki/index.php/Image:2005_12A_AMC-7.png)

Notice the [right triangle](https://artofproblemsolving.com/wiki/index.php/right_triangle) (in blue) with legs 1, $x+1$ and [hypotenuse](https://artofproblemsolving.com/wiki/index.php/hypotenuse) $\sqrt{50}.$ By the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem), we have $1^2 + (x+1)^2 = (\sqrt{50})^2 \Longrightarrow (x+1)^2 = 49 \Longrightarrowx = 6$. Thus, [EFGH] $= x^2 = $36\ $\mathrm{(C)}$
## See also
