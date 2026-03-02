# 2006 AMC 12B Problem 13

## Problem
Rhombus  ABCD is similar to rhombus  BFDE.  The area of rhombus  ABCD is 24, and  $\angle BAD = 60^\circ.$  What is the area of rhombus  BFDE?


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(linewidth(0.7)+fontsize(11)); pair A=origin, B=(2,0), C=(3, sqrt(3)), D=(1, sqrt(3)), E=(1, 1/sqrt(3)), F=(2, 2/sqrt(3)); pair point=(3/2, sqrt(3)/2); draw(B--C--D--A--B--F--D--E--B); label("$A$", A, dir(point--A)); label("$B$", B, dir(point--B)); label("$C$", C, dir(point--C)); label("$D$", D, dir(point--D)); label("$E$", E, dir(point--E)); label("$F$", F, dir(point--F));
```


$$\textrm{(A) } 6 \qquad \textrm{(B) } 4\sqrt {3} \qquad \textrm{(C) } 8 \qquad \textrm{(D) } 9 \qquad \textrm{(E) } 6\sqrt {3}$$

## Solution 1
The ratio of any length on ABCD to a corresponding length on $BFDE^2$ is equal to the ratio of their areas. Since $\angle BAD=60 , \triangle ADB$ and $\triangle DBC$ are equilateral. DB, which is equal to AB, is the diagonal of rhombus ABCD. Therefore, AC=$\frac{DB(2)}{2\sqrt{3}}=\frac{DB}{\sqrt{3}}. DB$ and AC are the longer diagonal of rhombuses BEDF and ABCD, respectively. So the ratio of their areas is ($\frac{1}{\sqrt{3}})^2$ or $\frac{1}{3}.$ One-third the area of ABCD is equal to 8. So the answer is $\boxed{\text{C}}.$
### Solution 2
Draw the line  $\overline{DB}$ to form an equilateral triangle, since $\angle BAD=60,$ and line segments
 $\overline{AB}$ and  $\overline{AD}$ are equal in length. To find the area of the smaller rhombus, we only need to find the value of any arbitrary base, then square the result. To find the value of the base, use the line we just drew and connect it to point E at a right angle along line  $\overline{DB}.$ Call the connected point P, with triangles DPE and EPB being 30-60-90 triangles, meaning we can find the length of  $\overline{ED}$ or  $\overline{EB}.$ The base of ABCD must be $\sqrt{24},$ and half of that length must be $\sqrt{6}(t$riangles DPE and EPB are congruent by SSS). Solving for the third length yields $\sqrt{8},$ which we square to get the answer $\boxed{\text{C}}.$
### Solution 3
Draw line DB, cutting rhombus BFDE into two triangles which fit nicely into 2/3 of equilateral triangle ABD. Thus the area of BFDE is (2/3)*12=8.
## See also
