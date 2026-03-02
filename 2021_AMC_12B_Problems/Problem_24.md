# 2021 AMC 12B Problem 24

## Problem
Let ABCD be a parallelogram with area 15. Points P and Q are the projections of A and C, respectively, onto the line BD; and points R and S are the projections of B and D, respectively, onto the line AC. See the figure, which also shows the relative locations of these points.


> [Asymptote diagram - not rendered in Markdown]

```asy
size(350); defaultpen(linewidth(0.8)+fontsize(11)); real theta = aTan(1.25/2); pair A = 2.5*dir(180+theta), B = (3.35,0), C = -A, D = -B, P = foot(A,B,D), Q = -P, R = foot(B,A,C), S = -R; draw(A--B--C--D--A^^B--D^^R--S^^rightanglemark(A,P,D,6)^^rightanglemark(C,Q,D,6)); draw(B--R^^C--Q^^A--P^^D--S,linetype("4 4")); dot("$A$",A,dir(270)); dot("$B$",B,E); dot("$C$",C,N); dot("$D$",D,W); dot("$P$",P,SE); dot("$Q$",Q,NE); dot("$R$",R,N); dot("$S$",S,dir(270));
```


Suppose PQ=6 and RS=8, and let d denote the length of $\overline{BD},$ the longer diagonal of ABCD. Then d^2 can be written in the form $m+n\sqrt$ p, where m,n, and p are positive integers and p is not divisible by the square of any prime. What is m+n+p?

$\textbf{(A) }81 \qquad \textbf{(B) }89 \qquad \textbf{(C) }97\qquad \textbf{(D) }105 \qquad \textbf{(E) }113$
## Solution 1
Let X denote the intersection point of the diagonals AC and BD. Remark that by symmetry X is the midpoint of both $\overline{PQ}$ and $\overline{RS},$ so XP = XQ = 3 and XR = XS = 4. Now note that since $\angle APB = \angle ARB = 90^\circ,$ quadrilateral ARPB is cyclic, and so
XR$\cdot XA = XP\cdot XB,w$hich implies $\tfrac{XA}{XB} = \tfrac{XP}{XR} = \tfrac34.$

Thus let x> 0 be such that XA = $3x$ and XB = $4x$. Then Pythagorean Theorem on $\triangle APX$ yields AP = $\sqrt{AX^2 - XP^2} = 3\sqrt{x^2-1},$ and so[ABCD] = 2[ABD] = AP$\cdot BD = 3\sqrt{x^2-1}\cdot 8x = 24x\sqrt{x^2-1}=15$Solving this for $x^2$ yields $x^2 =\tfrac12 + \tfrac{\sqrt{41}}8,$ and so$(8x)^2 =64x^2 =64\left(\tfrac12 + \tfrac{\sqrt{41}}8\right) = 32 + 8\sqrt{41}.$The requested answer is 32 + 8 + $41 =\boxed{\textbf{(A)} ~81}.$
## Solution 2 (Trig)
Let X denote the intersection point of the diagonals AC and BD, and let $\theta = \angle{COB}.$ Then, by the given conditions, XR = 4, XQ = 3, [XCB] = $\frac{15}{4}.$ So,

$$
XC = \frac{3}{\cos \theta}
XB \cos \theta = 4
\frac{1}{2} XB XC \sin \theta = \frac{15}{4}
$$

Combining the above 3 equations, we get
$$\frac{\sin \theta }{\cos^2 \theta} = \frac{5}{8}.$$
Since we want to find $d^2 = 4XB^2 =\frac{64}{\cos^2 \theta},$ we let x = $\frac{1}{\cos^2 \theta}.$ Then

$$\frac{\sin^2 \theta }{\cos^4 \theta} = \frac{1-\cos ^2 \theta}{\cos^4 \theta} = x^2 - x = \frac{25}{64}.$$

Solving this, we get $x =\frac{4 + \sqrt{41}}{8},$ so $d^2 =64x = 32 + 8\sqrt{41} \rightarrow 32+8+41=\boxed{\textbf{(A)} ~81}$
## Solution 3 (Similar Triangles and Algebra)
Let X be the intersection of diagonals AC and BD. By symmetry [$\triangle XCB$] = $\frac{15}{4}, XQ = 3$ and XR = 4, so now we have reduced all of the conditions one quadrant. Let CQ = x. XC = $\sqrt{x^2+9}, RB = \frac{4x}{3}$ by similar triangles and using the area condition we get $\frac{4}{3} \cdot$ x $\cdot \sqrt{x^2+9} = \frac{15}{2}.$ Note that it suffices to find XB = $\frac{4}{3}\sqrt{x^2+9}$ because we can double and square it to get d^2. Solving for $a = x^2 in$ the above equation, and then using $d^2 =\frac{64}{9}(x^2+9) = 8\sqrt{41} + 32 \Rightarrow 8+41+32=\boxed{\textbf{(A)} ~81}$
## Solution 4 (Similar Triangles)
Again, Let X be the intersection of diagonals AC and BD. Note that triangles $\triangle QXC$ and $\triangle BXR$ are similar because they are right triangles and share $\angle CXQ.$ First, call the length of XB = $\frac{d}{2}.$ By the definition of an area of a parallelogram, CQ $\cdot 2XB = 15,$ so CQ = $\frac{15}{d}.$ Using similar triangles on $\triangle QXC$ and $\triangle BXR, \frac{CQ}{XQ} = \frac{BR}{XR}.$ Therefore, finding BR, BR = $\frac{XR}{XQ} \cdot CQ = \frac{4}{3} \cdot \frac{15}{d} = \frac{20}{d}.$ Now, applying the Pythagorean theorem once, we find ($\frac{20}{d}) ^2 + (4)^2 = (\frac{d}{2}) ^2.$ Solving this equation for $d^2,$ we find $d^2=\frac{64+\sqrt{4096+6400}}{2}=32+8\sqrt{41} \rightarrow 32+8+41= \boxed{\textbf{(A)} ~81}$
## Solution 5
Let BQ = PD = x. We know that the area of the parallelogram is 15, so it follows that [$\triangle{BCD}$] = [$\triangle{BAD}$] = $\tfrac{15}{2}$ and the height of each triangle, which are also the lengths of QC and AP, is $\tfrac{15}{2(x+3)}.$ Suppose that E = RS $\cap BD.$ Because $\angle{BRE} = \angle{CQE}$ and $\angle{BER} = \angle{CQD},$ we have $\triangle{BRE} \sim \triangle{CQE}.$ The length of CE, by the Pythagorean Theorem is $\sqrt{3^2+(\tfrac{15}{2(x+3)})^2}$ and the length of BR, by the Pythagorean Theorem on $\triangle{BRE},$ is $\sqrt{(x+3)^2 - 4}.$ Note that
 $\sin{\angle QEC} = \frac{CQ}{CE} = \frac{BR}{BE}$
Substituting in our values,

$$\frac{\frac{15}{2(x+3)}}{\sqrt{9+(\frac{15}{2(x+3)})^2}} = \frac{\sqrt{(x+3)^2 - 4^2}}{x+3}$$

To rid unnecessary computation, we let $(x+3)^2$ = a. The equation simplifies, after cross multiplying, to

$$
\sqrt{9+\frac{15^2}{4a}} \sqrt{a-16 } = \frac{15}{2}
36a^2 - 576a - 15^2\cdot 16 = 0
a^2-16a-100 =0
$$

By the quadratic formula, a $\in\{\tfrac{16 - \sqrt{656}}{2}, \tfrac{16 + \sqrt{656}}{2}\}$, so we discard the negative solution. The value of $BD^2$ is

$$BD^2 = (2x+6)^2 = 4(x+3)^2 = 4a = 4 \cdot \frac{16 + \sqrt{656}}{2} = 32+8\sqrt{41}$$

and the desired answer is 32+8+41 = $\boxed{\textbf{(A)} ~81}$ ~skyscraper
## Solution 6 (Similar Triangles & Pythagorean Theorem)
Let the intersection of RS and BD be X.


$$\because \angle APX = \angle DSX and \angle AXP = \angle DXS, \triangle APX \sim \triangle DSX by AA$$


$$\therefore \frac{PA}{DS} = \frac68 = \frac34, DS = \frac43 \cdot PA$$

By the Pythagorean theorem and the property of projection, BD^2 = (DS+BR)^2 + RS^2 = 4DS^$2 + 64 = 4(\frac43 \cdot PA)^2 + 64 = \frac{64}{9} \cdot PA^2 + 64, \frac{64}{9} \cdot PA^2 = BD^2 - 64$

$$\because [ABCD] = PA \cdot BD = 15, \therefore PA = \frac{15}{BD}$$

$$\frac{64}{9} (\frac{15}{BD})^2 = BD^2 - 64$$

$$\frac{1600}{BD^2} = BD^2 - 64$$

$$BD^4 - 64 BD^2 - 1600 = 0$$

$$BD^2 = \frac{64 + \sqrt{64^2 - 4 (-1600)}}{2} = 32 + 8 \sqrt{41}$$

Therefore, the answer is 32 + 8 + 41 = $\boxed{\textbf{(A) } 81}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7
Let O be the intersection of the diagonals in quadrilateral ABCD and let the origin be at O.

Then, let BD be on the x-axis, making $\vec{Q}=\begin{pmatrix}$3 \\ $0\end{pmatrix}, \vec{C}=\begin{pmatrix}$3 \\ $y\end{pmatrix}, \vec{B}=\begin{pmatrix}$x \\ $0\end{pmatrix},$ and $\vec{D}=\begin{pmatrix}-x$ \\ $0\end{pmatrix}.$

The area of $\triangle BDC$ is half the area of ABCD, so,
$\frac{1}{2}(\overline{BD})(\overline{QC})=\frac{1}{2}(ABCD)$

$$
\frac{1}{2}(2x)(y)=\frac{1}{2}(15)
xy=\frac{15}{2}
y= \frac{15}{2x}.
$$


Also, $\vec{R}$ is the projection of $\vec{B}$ onto $\vec{AC},$ which is the same as projecting it onto $\vec{C}.$ We get:
$\vec{R}=p$$roj_{\vec{C}}${($\vec{B})$}=$\frac{\vec{B} \cdot \vec{C}}{\vec{C} \cdot \vec{C}}(\vec{C})=\frac{\begin{pmatrix}x \\ 0\end{pmatrix} \cdot \begin{pmatrix}3 \\ y\end{pmatrix}}{\begin{pmatrix}3 \\ y\end{pmatrix} \cdot \begin{pmatrix}3 \\ y\end{pmatrix}}\begin{pmatrix}$3 \\ $y\end{pmatrix}=\frac{3x}{y^2+9}\begin{pmatrix}$3 \\ $y\end{pmatrix}$

We are given that $\overline{RS} = 8,$ so ||$\vec{RS}$|| = 8. Because diagonals bisect each other in a parallelogram, ||$\vec{R}$|| = $\frac{8}{2} = 4.$ Substituting ||$\vec{R}$|| with the previous equation gives:

$$
||\frac{3x}{y^2+9}\begin{pmatrix}3 \\ y\end{pmatrix}|| = 4
$$


$$
\frac{3x}{y^2+9}\sqrt{y^2+9} = 4
\frac{3x}{\sqrt{y^2+9}} = 4
$$

Squaring both sides gives:

$$
\frac{9x^2}{y^2+9}=16
9x^2=16y^2+144
$$

Substituting $y=\frac{15}{2x}$:

$$
9x^2=16\left(\frac{15}{2x}\right)^2+144
9x^2=16\left(\frac{225}{4x^2}\right)+144
9x^4=144x^2+900
x^4-16x^2-100=0
$$

Solving the quadratic for $x^2$ gives:
$$x^2 = \frac{16 \pm \sqrt{16^2 - 4(1)(-100)}}{2} = 8 \pm 2\sqrt{41}$$
But $x^2$ is nonnegative, so $x^2$ must be 8 + $2\sqrt{41}.$ We are looking for $\overline{BD}^2,$ which is $4x^2.$ 4(8 + 2\sqrt{41}) = 32 + $8\sqrt{41},$ so a + b + $c = 32 + 8 + 41 =\boxed{\textbf{(A) } 81}$ ~askeww (My first solution ever!)
## Solution 8
First and foremost, the condition given in the problem could be represented. Moreover, let QB=x and CQ=h for convenience.

> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; size(10cm); defaultpen(linewidth(1)); pair A = (-2.0833333333, -1.3020833333); pair B = (3.35, 0.0); pair C = (2.0833333333, 1.3020833333); pair D = (-3.35, 0.0); pair P = (-2.0833333333, 0.0); pair Q = (2.0833333333, 0.0); pair R = (2.4109375, 1.5052083333); pair S = (-2.4109375, -1.5052083333); pair O = (0,0); draw(A--B--C--D--cycle); draw(A--C); draw(D--O); draw(A--P, dashed); draw(D--S, dashed); draw(R--S); draw(O--C--Q--cycle, red+1.2); draw(O--B--R--cycle, blue+0.8); draw(rightanglemark(A,P,Q,8)); draw(rightanglemark(C,Q,D,8)); draw(rightanglemark(D,S,R,8)); draw(rightanglemark(B,R,S,8)); label("$A$", A, S); label("$B$", B, E); label("$C$", C, N); label("$D$", D, W); label("$P$", P, NE); label("$Q$", Q, S); label("$R$", R, N); label("$S$", S, S); label("$3$", midpoint(P--O), S); label("$3$", midpoint(O--Q), S); label("$x$", midpoint(Q--B), S); label("$h$", midpoint(C--Q), E); label("$\frac{4}{3}h$", midpoint(R--B), E); label("$8$", midpoint(R--S), N+0.4*dir(90));
```

Using the property of a parallelogram, it could be inferred that $\frac{h(3+x)}{2}=\frac{15}{4}.$ Moreover, Pythagorean Theorem manifests that $\left(\frac{4}{3}h\right)^2+4^2=(3+x)^2.$

$$
\begin{align*} 3+x&=\frac{15}{2h} \\ \left(\frac{4}{3}h\right)^2+4^2&=\left(\frac{15}{2h}\right)^2 \\ \frac{16h^2}{9}+16&=\frac{225}{4h^2} \\ 64h^4+576h^2-2025&=0 \\ h^2&\Rightarrow\frac{9\sqrt{41}-36}{8} \end{align*}
$$


$$
\begin{align*} \left(\frac{4}{3}h\right)^2+4^2&=(3+x)^2 \\ \frac{16}{9}\cdot\frac{9\sqrt{41}-36}{8}+4^2&=(3+x)^2 \\ 2\sqrt{41}-8+16&=(3+x)^2 \\ (3+x)^2&=8+2\sqrt{41} \\ d^2=4(3+x)^2&=32+8\sqrt{41} \\ \end{align*}
$$

Thus, $32+8+41=\boxed{\textbf{(A) }81}.$

*~MaPhyCom*
## Solution 9(Similar to other solutions)
We first note that DS and BR are perpendicular to AC. Then, let DS = BR = h. Furthermore, let AS = x and the intersections of diagonals AC and BD be T. We note that triangle APT is similar to triangle STD. We will also show that the areas of triangles ADT, BCT, CDT, ABT are the same namely $\frac{15}{4}.$ Let $\angle DTA = \theta.$ Then, $\angle DTC = \pi - \angle DTA = \pi - \theta.$ Let DP = QB = y. Obviously, PT = QT = $\frac{6}{2} = 3.$ Also, AT = CT = 4 - x. Then the area of triangle ADT is just $\frac{1}{2} \cdot (y + 3)(4 - x) \cdot \sin(\theta).$ It is easy to see that CBT is congruent to ADT and ABT is congruent to CDT so it suffices to show triangle CDT has the same area as triangle ADT. In fact, the area equals $\frac{1}{2} \cdot (y + 3)(4 - x) \cdot \sin(\pi - \theta) = \frac{1}{2} \cdot (y + 3)(4 - x) \cdot \sin(\theta)$ which indeed is equal to the area of triangle ADT. Hence, each of these triangles breaks the area of the entire parallelogram into 4 pieces so each area is $\frac{15}{4}.$ Look at triangle ADT. The base is y + 3. Let the height equal m. Hence:


$$\frac{1}{2} \cdot m \cdot (y + 3) = \frac{15}{4} \implies m = \frac{15}{2(y + 3)}$$


Remember that we established the fact that triangle APT is similar to triangle STD and so:

$$\frac{4}{3} = \frac{\frac{15}{2(y + 3)}}{h} \implies h(y + 3) = 10$$

Also by the Pythagorean Theorem on triangle STD


$$h^{2} + 16 = (y + 3)^{2} \implies h^{2} + 16 = \frac{100}{h^{2}} \implies h^{4} + 16h^{2} - 100 = 0 \implies h^{2} = \frac{-16 \pm \sqrt{16 \cdot 16 - 4(-100)}}{2} = \frac{-16 \pm \sqrt{16 \cdot 16 + 16 \cdot 25}}{2} = \frac{-16 \pm 4\sqrt{41}}{2} = -8 \pm 2\sqrt{41}.$$


Since $h^{2}$ is positive, $h^{2}$ = -8 + $2\sqrt{41}.$ We need to find $BD^{2}$ = (y + 3 + 3 + $y)^{2}=4(y + 3)^{2}$$$ so remember (y + $3)^{2}=\frac{100}{h^{2}} = \frac{100}{-8 + 2\sqrt{41}} = 8 + 2\sqrt{41}.$ But $BD^{2}$ is 4 times this so the answer is $4(8 + $2\sqrt{41}) = 32 + $8\sqrt{41}.$ Hence $32 + 8 + 41 = 81\implies \boxed{\textbf{(A)}}$

*~ilikemath247365*
## Video Solution by MOP 2024
https://youtube.com/watch?v=xtYSPxOMZlk
## Video Solution by OmegaLearn (Cyclic Quadrilateral and Power of a Point)
https://youtu.be/1zhwR9B2Gy8

*~pi_is_3.14*
## Video Solution (Simple: Using trigonometry and Equations)
https://youtu.be/ZB-VN02H6mU
*~hippopotamus1*
## Video Solution by TheBeautyofMath with Speed Tactics
https://youtu.be/mB_I3FmoPVA

*~IceMatrix*
## See Also
