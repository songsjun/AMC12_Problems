# 2014 AMC 12B Problem 9

## Problem
Convex quadrilateral  ABCD  has  AB=3 ,  BC=4 ,  CD=13 ,  AD=12 , and  $\angle ABC=90^{\circ}$ , as shown. What is the area of the quadrilateral?


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(0,0), B=(-3,0), C=(-3,-4), D=(48/5,-36/5); draw(A--B--C--D--A); label("$A$",A,N); label("$B$",B,NW); label("$C$",C,SW); label("$D$",D,E); draw(rightanglemark(A,B,C,25));
```


$\textbf{(A)}\ 30\qquad\textbf{(B)}\ 36\qquad\textbf{(C)}\ 40\qquad\textbf{(D)}\ 48\qquad\textbf{(E)}\ 58.5$
## Solution
Note that by the pythagorean theorem, AC=5.  Also note that $\angle CAD$ is a right angle because $\triangle CAD$ is a right triangle.  The area of the quadrilateral is the sum of the areas of $\triangle ABC$ and $\triangle CAD$ which is equal to
$$\frac{3\times4}{2} + \frac{5\times12}{2} = 6 + 30 = \boxed{\textbf{(B)}\ 36}$$
## Video Solution by OmegaLearn
https://youtu.be/4_x1sgcQCp4?t=923

*~pi_is_3.14*
## See also
