# 2011 AMC 12B Problem 16

> This problem is the same as [2011 AMC 12B #16](https://artofproblemsolving.com/wiki/index.php/2011_AMC_12B_Problems) and [2011 AMC 10B #20](https://artofproblemsolving.com/wiki/index.php/2011_AMC_10B_Problems).
## Problem
Rhombus $ABCD$ has side length $2$ and $\angle B = 120$°. Region $R$ consists of all points inside the rhombus that are closer to vertex $B$ than any of the other three vertices. What is the area of $R$?

$\textbf{(A)}\ \frac{\sqrt{3}}{3} \qquad\textbf{(B)}\ \frac{\sqrt{3}}{2} \qquad\textbf{(C)}\ \frac{2\sqrt{3}}{3} \qquad\textbf{(D)}\ 1 + \frac{\sqrt{3}}{3} \qquad\textbf{(E)}\ 2$
## Solution 1
Suppose that $P$ is a point in the rhombus $ABCD$ and let $\ell_{BC}$ be the [perpendicular bisector](https://artofproblemsolving.com/wiki/index.php/perpendicular_bisector) of $\overline{BC}$. Then $PB < PC$ if and only if $P$ is on the same side of $\ell_{BC}$ as $B$. The line $\ell_{BC}$ divides the plane into two half-planes; let $S_{BC}$ be the half-plane containing $B$. Let us define similarly $\ell_{BD},S_{BD}$ and $\ell_{BA},S_{BA}$. Then $R$ is equal to $ABCD \cap S_{BC} \cap S_{BD} \cap S_{BA}$. The region turns out to be an irregular pentagon. We can make it easier to find the area of this region by dividing it into four triangles:

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm);
defaultpen(linewidth(0.8pt)+fontsize(10pt));
dotfactor=4;
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(4,0), B=(2,2sqrt(3)), C=(-2,2sqrt(3)), D=(0,0), E=(B+C)/2, F=(B+C+D)/3, G=(A+C)/2, H=(A+B+D)/3, I=(A+B)/2;
fill((0,2sqrt(3))--B--(3,sqrt(3))--(2,(2sqrt(3))/3)--(0,(4sqrt(3))/3)--cycle,gray);
draw(A--B--C--D--cycle);
draw(D--(0,2sqrt(3))); draw(D--(3,sqrt(3))); draw(A--C); draw(F--B--H); draw(B--G);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$A$",A,SE);label("$B$",B,NE);label("$C$",C,NW);label("$D$",D,SW);
label("$E$",E,N);label("$F$",F,SW);label("$G$",G,SW);label("$H$",H,S);label("$I$",I,NE);
label("$2$",(D--C),SW);
```

</asy>
Since $\triangle BCD$ and $\triangle BAD$ are equilateral, $\ell_{BC}$ contains $D$, $\ell_{BD}$ contains $A$ and $C$, and $\ell_{BA}$ contains $D$. Then $\triangle BEF \cong \triangle BGF \cong \triangle BGH \cong \triangle BIH$ with BE $= 1$ and $EF = \frac{1}{\sqrt{3}}$ so $[BEF] = \frac{1}{2}\cdot 1 \cdot \frac{\sqrt{3}}{3}$. Multiply this by 4 and it turns out that the pentagon has area $\boxed{(C)\frac{2\sqrt{3}}{3}}$.
## Solution 2
We follow the steps shown above until we draw pentagon $BIHFE$. We know that rhombus $ABCD$ can be divided into equilateral triangles $\triangle ABD$ and $\triangle CBD$. Using the $30-60-90$ special right triangle rules, we find the height of the equilateral triangles (and the height of the rhombus) to be $\sqrt{3}$. Therefore, the area of $ABCD$ is $\sqrt{3}$. We now have to take off the areas $\triangle CDA$, $\triangle CEF$, and $\triangle AIH$ to get the desired shape. $\triangle CDA$ is just half of $ABCD$ (\sqrt {3})$$ and $\triangle AIH$ and $\triangle CEF$ are each $\frac{\sqrt {3}}{6}$, for a total area of $\sqrt {3}\sqrt {3}\frac{\sqrt{3}}{6}-\frac{\sqrt{3}}{6}=\boxed{(C)\frac{2\sqrt{3}}{3}}$.
## Solution 3
We split rhombus $ABCD$ into two equilateral triangles, $ABD$ and $BCD$. In triangle $ABD$, the probability that a randomly selected point is closer to $B$ than either other point is $\frac{1}{3}$ *. Similarly, in triangle $BCD$, the same principle applies. Thus, the area of the region closer to $B$ than $A$, $C$, or $D$ is $\frac{1}{3} [ABD] + \frac{1}{3} [BCD]$. Since $ABD$ and $BCD$ are congruent, we have $\frac{1}{3} [ABD] + \frac{1}{3} [BCD] = \frac{2}{3} [ABD] = \frac{2}{3} \cdot \frac{s^2\sqrt{3}}{4} = \frac{2}{3} \cdot \frac{(2)^2\sqrt{3}}{4} = \boxed{\frac{2\sqrt3}{3} = C}$, and we are done.

\*See note
## Solution 4
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm);
defaultpen(linewidth(0.8pt)+fontsize(10pt));
dotfactor=4;
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(4,0), B=(2,2sqrt(3)), C=(-2,2sqrt(3)), D=(0,0), E=(B+C)/2, F=(B+C+D)/3, G=(A+B+D)/3, H=(A+B)/2;
fill((0,2sqrt(3))--B--(3,sqrt(3))--(2,(2sqrt(3))/3)--(0,(4sqrt(3))/3)--cycle,gray);
draw(A--B--C--D--cycle);
draw(D--(0,2sqrt(3))); draw(D--(3,sqrt(3))); draw(A--C); draw(F--B--H); draw(B--G);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$A$",A,SE);label("$B$",B,NE);label("$C$",C,NW);label("$D$",D,SW);
label("$E$",E,N);label("$F$",F,SW);label("$G$",G,S);label("$H$",H,E);
label("$2$",(D--C),SW);
```

</asy>
Since $H$ and $E$ are halfway between $AB$ and $CB$, respectively, we know that $\overline{BH}=\overline{BE}=1$. By symmetry, $\Delta BFG$ is equilateral, so $\angle FBG=60^\circ\implies\angle EBF=\angle HBG=30^\circ$ and therefore $\Delta EBF$ and $\Delta HBG$ are 30-60-90 right triangles.
Thus, $[\Delta EBF]=[\Delta BFG]=\dfrac1{2\sqrt3}$.
We know that $\overline{FB}=\overline{GB}=\dfrac2{\sqrt3}$, so therefore $[\Delta BFG]=\dfrac{\sqrt3}4\left(\dfrac2{\sqrt3}\right)^2=\dfrac1{\sqrt3}$.
Summing these three regions, we get $\dfrac1{2\sqrt3}+\dfrac1{2\sqrt3}+\dfrac1{\sqrt3}=\boxed{\textbf{(C)}~\dfrac{2\sqrt3}3}$.
*~Technodoggo, Asymptote diagram modified from Solution 1*
## Solution 5
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm);
defaultpen(linewidth(0.8pt)+fontsize(10pt));
dotfactor=4;
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(4,0), B=(2,2sqrt(3)), C=(-2,2sqrt(3)), D=(0,0), E=(B+C)/2, F=(B+C+D)/3, G=(A+B+D)/3, H=(A+B)/2;
fill((0,2sqrt(3))--B--(3,sqrt(3))--(2,(2sqrt(3))/3)--(0,(4sqrt(3))/3)--cycle,gray);
draw(A--B--C--D--cycle);
draw(D--F); draw(D--G); draw(F--C); draw(A--G); draw(F--B); draw(B--G);
draw(B--D);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$A$",A,SE);label("$B$",B,NE);label("$C$",C,NW);label("$D$",D,SW);
label("$E$",E,N);label("$F$",F,SW);label("$G$",G,S);label("$H$",H,E);
label("$2$",(D--C),SW);
```

</asy>
To keep it simple, break rhombus $ABCD$ into two triangles, $ABD$ and $BCD$. To see the area closest to the point $B$, notice that a third of each triangle, which contains all the points nearest to $B$ in each triangle, is easily visualizable. Thus, a third of rhombus $ABCD$ must be found.

We find the total area of rhombus $ABCD$, which we can again split into two congruent equilateral triangles with side length $2$. Using the formula of equilateral triangles and then multiplying by $\dfrac{1}{3}$:


$$\dfrac{\sqrt{3}}{4}\cdot 2^2 \cdot 2 \cdot \dfrac{1}{3} = 2\sqrt{3} \cdot \dfrac{1}{3} = \boxed{\textbf{(C)}~\dfrac{2\sqrt{3}}{3}}$$


*~NSAoPS, diagram modified from Solution 1.*
## Note
There is an intuitive explanation for why the shaded region is one third of the rhombus. Consider one of the equilateral triangles; the figure is symmetrical, so one half of the shaded region should be in the triangle. Note that the perpendicular bisectors we constructed in previous solutions to deliminate $R$ must be medians, as the triangle is equilateral. Therefore, recalling that the three intersecting medians of a triangle divide it into 6 smaller triangles of equal area, we observe that the shaded region in the equilateral triangles includes precisely two of these smaller triangles. We can repeat this with the other equilateral triangle that forms the rhombus, and thus we conclude that the shaded area is one third of the rhombus's total area.

*~LeonQS*
## Video Solution by TheBeautyofMath
https://youtu.be/gCmQlaiEG5A

*~IceMatrix*
## See Also
