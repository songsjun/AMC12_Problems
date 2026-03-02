# 2003 AMC 12A Problem 14

## Problem
Points K, L, M, and N lie in the plane of the square ABCD such that AKB, BLC, CMD, and DNA are equilateral triangles. If ABCD has an area of 16, find the area of KLMN.


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2cm); defaultpen(fontsize(8)+linewidth(0.8)); pair A=(-0.5,0.5), B=(0.5,0.5), C=(0.5,-0.5), D=(-0.5,-0.5); pair K=(0,1.366), L=(1.366,0), M=(0,-1.366), N=(-1.366,0); draw(A--N--K--A--B--K--L--B--C--L--M--C--D--M--N--D--A); label("$A$",A,SE); label("$B$",B,SW); label("$C$",C,NW); label("$D$",D,NE); label("$K$",K,NNW); label("$L$",L,E); label("$M$",M,S); label("$N$",N,W);
```


$$\textrm{(A)}\ 32\qquad\textrm{(B)}\ 16+16\sqrt{3}\qquad\textrm{(C)}\ 48\qquad\textrm{(D)}\ 32+16\sqrt{3}\qquad\textrm{(E)}\ 64$$

## Solution
### Solution 1
Since the area of square $\text{ABCD}$ is 16, the side length must be 4. Thus, the side length of triangle AKB is 4, and the height of $\text{AKB},$ and thus $\text{DMC},$ is $2\sqrt{3}.$

The diagonal of the square $\text{KNML}$ will then be $4+4\sqrt{3}.$ From here there are 2 ways to proceed:

First: Since the diagonal is $4+4\sqrt{3},$ the side length is $\frac{4+4\sqrt{3}}{\sqrt{2}},$ and the area is thus $\frac{16+48+32\sqrt{3}}{2}=\boxed{\textbf{(D) } 32+16\sqrt{3}}.$

Second: Since a square is a rhombus, the area of the square is $\frac{d_1d_2}{2},$ where $d_1$ and $d_2$ are the diagonals of the rhombus. Since the diagonal is $4+4\sqrt{3},$ the area is $\frac{(4+4\sqrt{3})^2}{2}=\boxed{\textbf{(D) } 32+16\sqrt{3}}.$
### Solution 2
Because ABCD has area 16, its side length is simply $\sqrt{16}\implies 4.$

Angle chasing, we find that the angle of KBL=360-(90+$2(60)$)=360-(210)=150.

We also know that KB=4, BL=4.

Using Law of Cosines, we find that side $(KL)^2=16+16-2(16)$cos{150}$\implies (KL)^2=32+\frac{32\sqrt{3}}{2}\implies (KL)^2=32+16\sqrt{3}.$

However, the area of KLMN is simply $(KL)^2,$ hence the answer is $\boxed{\textbf{(D) } 32+16\sqrt{3}}$
### Solution 3
First we show that KLMN is a square. How? Show that it is a rhombus that has a right angle.

$\angle{NAK}=\angle{KBL}=\angle{LCM}=\angle{DNM}=150^\circ.$ All the sides of the equilateral triangles are equal, so the triangles are congruent. Notice that $\angle{KNL}=45^\circ,$ etc, so $\angle{KNM}=90^\circ.$ So we have a square.

Instead of going to find KN using Law of Cosines, we can inscribe the square in another bigger one and then subtract the four right triangles in the corners, so after all of this, we find that the answer is $\boxed{\textbf{(D) } 32+16\sqrt{3}}$

*~hastapasta (edited)*
## See Also
