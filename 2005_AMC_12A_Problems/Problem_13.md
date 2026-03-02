# 2005 AMC 12A Problem 13

## Problem
In the five-sided star shown, the letters A, B, C, D and E are replaced by the numbers 3, 5, 6, 7 and 9, although not necessarily in that order. The sums of the numbers at the ends of the line segments $\overline{AB}, \overline{BC}, \overline{CD}, \overline{DE}$ and $\overline{EA}$ form an arithmetic sequence, although not necessarily in that order. What is the middle term of the arithmetic sequence?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(150); defaultpen(linewidth(0.8)); string[] strng = {'A','D','B','E','C'}; pair A=dir(90),B=dir(306),C=dir(162),D=dir(18),E=dir(234); draw(A--B--C--D--E--cycle); for(int $i=$0;i<=4;$i=i+1$) { path circ=circle(dir(90-72*i),0.125); unfill(circ); draw(circ); label("$"+strng[i]+"$",dir(90-72*i)); }
```


$$(\mathrm {A}) \ 9 \qquad (\mathrm {B}) \ 10 \qquad (\mathrm {C})\ 11 \qquad (\mathrm {D}) \ 12 \qquad (\mathrm {E})\ 13$$

## Solutions
### Solution 1
(A+B) + (B+C) + (C+D) + (D+E) + (E+A) = $2(A+B+C+D+E)$ (i.e., each number is counted twice). The sum A + B + C + D + E will always be $3 + 5 + 6 + 7 + 9 = 30$, so the arithmetic sequence has a sum of 2 $\cdot 30 = 60.$ The middle term must be the average of the five numbers, which is $\frac{60}{5} = 12 \Longrightarrow \mathrm{(D)}.$
### Solution 2
Let the terms in the arithmetic sequence be a, a + d, a + $2d$, a + $3d$, and a + $4d$. We seek the middle term a + $2d$.

These five terms are A + B, B + C, C + D, D + E, and E + A, in some order. The numbers A, B, C, D, and E are equal to 3, 5, 6, 7, and 9, in some order, so
$$A + B + C + D + E = 3 + 5 + 6 + 7 + 9 = 30.$$
Hence, the sum of the five terms is
$$(A + B) + (B + C) + (C + D) + (D + E) + (E + A) = 2A + 2B + 2C + 2D + 2E = 60.$$
But adding all five numbers, we also get a + (a + d) + (a + $2d) + (a + 3d) + (a + 4d) = 5a+10d$, so
$$5a + 10d = 60.$$
Dividing both sides by 5, we get a + $2d=\boxed{12},$ which is the middle term. The answer is (D).
### Solution 3
Not too bad with some logic and the awesome guess and check. Let A=6. Then let B=7,E=5 and C=3,D=9. Our arithmetic sequence is 10,11,12,13,14 so our answer is 12 $\Longrightarrow \mathrm{(D)}.$

Solution by franzliszt
## See also
