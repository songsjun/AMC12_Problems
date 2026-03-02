# 2025 AMC 12A Problem 11

## Problem
The orthocenter of a triangle is the concurrent intersection of the three (possibly extended) altitudes. What is the sum of the coordinates of the orthocenter of the triangle whose vertices are A(2,31), B(8,27), and C(18,27)?

$\textbf{(A)}~5\qquad\textbf{(B)}~17\qquad\textbf{(C)}~10+4\sqrt{17} +2\sqrt{13}\qquad\textbf{(D)}~\frac{113}{3}\qquad\textbf{(E)}~54$
## Solution 1
Altitudes are perpendicular to sides and pass through a vertex. We have the coordinates of the vertices and the slope of the sides can be found, meaning we have all the information needed to find the equations of the lines of the altitudes. Then, we only need to find the intersections of the lines

Since B and C form a horizontal line, the altitude to BC from A is a vertical line, so its equation must be $x=2$. Then, we need to find the equation of one more altitude to solve a system of equations, giving us the coordinates. Suppose we choose the second altitude to be the one from C to segment AB. The slope of segment AB is $-\frac{2}{3},$ so the slope of the altitude, which is perpendicular to AB, is $\frac{3}{2}.$ Since the altitude passes through C, by point-slope form, we have the equation of the altitude to be $y-27=\frac{3}{2}(x-18).$ Solving the two equations gives the coordinates of the orthocenter to be (2, 3). The answer is therefore $2+3=\boxed{\text{(A) }5}.$

*~dg6665  (edits for motivation by ~Logibyte)*
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); pair A = (2,31); pair B = (8, 27); pair C = (18, 27); pair H1 = (2, 27); pair H2 = (8.5882352941176, 29.3529411764706); pair D = (2,3); label("$A$", A, NW); label("$B$", (8.5, 27), S); label("$C$", C, SE); label("$H_1$", H1, SW); label("$H_2$", H2, NE); label("$E$", E, S); draw(A--B--C--cycle); draw(A--E, dashed); draw(H1--B, dashed); draw(H2--E, dashed);
```


Let the intersection of the heights and their corresponding sides be $H_1$ and $H_2$, respectively, and let the intersection of line $AH_1$ and $H_2B$ be E. Since $\angle EH_2A = \angle EH_1B = 90^{\circ}, \angle EBH_1 = 90^{\circ}- \angle BEH_1 = \angle EAH_2,$ we have

$\tan{\angle EBH_1} = \tan{\angle EAH_2} = \tan{\angle H_1AC} = \frac{CH_1}{AH_1} = 4$

Consequently,

$\frac{EH_1}{B_H1}=\frac{EH_1}{6}=\tan{\angle EBH_1}=4$

so $EH_1=24$, and the coordinates of E is exactly $(2, 31-4-24)=(2,3)$. Hence, the answer is $2+3=\boxed{\text{(A) }5}.$

*~Bloggish*
## Video Solution by Power Solve
https://www.youtube.com/watch?v=iqKA1sQ4Gwk
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
