# 2003 AMC 12B Problem 22

## Problem
Let ABCD be a [rhombus](https://artofproblemsolving.com/wiki/index.php/rhombus) with AC = 16 and BD = 30. Let N be a point on $\overline{AB},$ and let P and Q be the feet of the perpendiculars from N to $\overline{AC}$ and $\overline{BD},$ respectively. Which of the following is closest to the minimum possible value of PQ?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); defaultpen(0.6); pair O = (15*15/17,8*15/17), C = (17,0), D = (0,0), P = (25.6,19.2), Q = (25.6, 18.5); pair A = 2*O-C, B = 2*O-D; pair P = (A+O)/2, Q=(B+O)/2, N=(A+B)/2; draw(A--B--C--D--cycle); draw(A--O--B--O--C--O--D); draw(P--N--Q); label("$A$",A,WNW); label("$B$",B,ESE); label("$C$",C,ESE); label("$D$",D,SW); label("$P$",P,SSW); label("$Q$",Q,SSE); label("$N$",N,NNE);
```


$$\mathrm{(A)}\ 6.5 \qquad\mathrm{(B)}\ 6.75 \qquad\mathrm{(C)}\ 7 \qquad\mathrm{(D)}\ 7.25 \qquad\mathrm{(E)}\ 7.5$$

## Solution 1
Let $\overline{AC}$ and $\overline{BD}$ intersect at O. Since ABCD is a rhombus, then $\overline{AC}$ and $\overline{BD}$ are [perpendicular bisector](https://artofproblemsolving.com/wiki/index.php/perpendicular_bisector)s. Thus $\angle POQ = 90^{\circ},$ so OPNQ is a [rectangle](https://artofproblemsolving.com/wiki/index.php/rectangle). Since the diagonals of a rectangle are of equal length, PQ = ON, so we want to minimize ON. It follows that we want ON \perp AB.

Finding the area in two different ways,

$$\frac{1}{2} AO \cdot BO = 60 = \frac{1}{2} ON \cdot AB = \frac{\sqrt{8^2 + 15^2}}{2} \cdot ON \Longrightarrow ON = \frac{120}{17} \approx 7.06 \Rightarrow \mathrm{(C)}$$

## Solution 2 (semi-bash)
Let the intersection of $\overline{AC}$ and $\overline{BD}$ be E. Since ABCD is a rhombus, we have $\overline{AC}$\perp $\overline{BD}$ and AE = CE = $\dfrac{AC}{2} = 8.$ Since $\overline{NQ}$\perp $\overline{BD},$ we have $\overline{NQ}$\parallel $\overline{AC},$ so $\triangle{BNQ} \sim \triangle{BAE} \sim \triangle{NAP}.$ Therefore, $\dfrac{NP}{AP} = \dfrac{NP}{8 - NQ} = \dfrac{BE}{AE} = \dfrac{15}{8} \Rightarrow NP = 15 - \dfrac{15}{8} NQ.$ By Pythagorean Theorem, PQ^2 = NQ^2 + NP^2 = NQ^2 + $\left(15 - \dfrac{15}{8} NQ \right)^2 = \dfrac{289}{64} NQ^2 - \dfrac{225}{4} NQ + 225.$ The minimum value of $PQ^2$  would give the minimum value of PQ, so we take the derivative (or use vertex form) to find that the minimum occurs when NQ = $\dfrac{225 \cdot 8}{289}$ which gives $PQ^2 =\dfrac{225 \cdot 64}{289}.$ Hence, the minimum value of PQ is $\sqrt{\dfrac{225 \cdot 64}{289}} = \dfrac{120}{17},$ which is closest to 7 $\Rightarrow \boxed{\textbf{C}}.$

*~MP8148*
## Solution 3
Let the intersection $\overline{AC}$ and $\overline{BD}$ be E. Let $\overline{PE}=y \implies \overline{AP}=8-y$ and $\overline{EQ}=x \implies \overline$ {QB}=15-x. Since $\triangle NQB \sim \triangle APN,$ we have $\frac{8-y}{x}=\frac{y}{15-x} \implies 120=15y+8x$. We want to minimize $\overline{PQ}=\sqrt{x^2+y^2}.$ By Cauchy, $17^2(x^2+y^2)=(x^2+y^2)(8^2+15^2)\ge (8x+15y)^2=120^2 \implies \sqrt{x^2+y^2} \ge \frac{120}{17} \approx 7.$ So, choice $\boxed{C}$ is closest to the minimum.
## See also
