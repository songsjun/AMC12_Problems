# 2007 AMC 12B Problem 19

## Problem
Rhombus ABCD, with side length 6, is rolled to form a cylinder of volume 6 by taping $\overline{AB}$ to $\overline{DC}.$ What is $\sin(\angle ABC)$?


$$\mathrm{(A)}\ \frac{\pi}{9} \qquad \mathrm{(B)}\ \frac{1}{2} \qquad \mathrm{(C)}\ \frac{\pi}{6} \qquad \mathrm{(D)}\ \frac{\pi}{4} \qquad \mathrm{(E)}\ \frac{\sqrt{3}}{2}$$

## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
pair B=(0,0), A=(6*dir(60)), C=(6,0); pair D=A+C; draw(A--B--C--D--A); draw(A--(3,0)); label("$A$",A,NW);label("$B$",B,SW);label("$C$",C,SE);label("$D$",D,NE); label("$6$",A/2,NW); label("$\theta$",(.8,.5)); label("$h$",(3,2.6),E);
```


$V_{\mathrm{Cylinder}}$ = $\pir^2 h$

Where C = $2\pir = 6$ and $h=6\sin\theta$

$$r = \frac{3}{\pi}$$

$$V = \pi \left(\frac{3}{\pi}\right)^2\cdot 6\sin\theta$$

$$6 = \frac{9}{\pi} \cdot 6\sin\theta$$

$$\sin\theta = \frac{\pi}{9} \Rightarrow \mathrm{(A)}$$
## See Also
