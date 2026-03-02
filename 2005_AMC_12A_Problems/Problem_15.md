# 2005 AMC 12A Problem 15

## Problem
Let $\overline{AB}$ be a diameter of a circle and C be a point on $\overline{AB}$ with 2 $\cdot AC = BC.$ Let D and E be points on the circle such that $\overline{DC}$\perp $\overline{AB}$ and $\overline{DE}$ is a second diameter. What is the ratio of the area of $\triangle DCE$ to the area of $\triangle ABD$?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2.5cm); defaultpen(fontsize(10pt)+linewidth(.8pt)); dotfactor=3; pair O=(0,0), C=(-1/3.0), B=(1,0), A=(-1,0); pair D=dir(aCos(C.x)), E=(-D.x,-D.y); draw(A--B--D--cycle); draw(D--E--C); draw(unitcircle,white); drawline(D,C); dot(O); clip(unitcircle); draw(unitcircle); label("$E$",E,SSE); label("$B$",B,E); label("$A$",A,W); label("$D$",D,NNW); label("$C$",C,SW); draw(rightanglemark(D,C,B,2));
```


$$(\text {A}) \ \frac {1}{6} \qquad (\text {B}) \ \frac {1}{4} \qquad (\text {C})\ \frac {1}{3} \qquad (\text {D}) \ \frac {1}{2} \qquad (\text {E})\ \frac {2}{3}$$

## Solution
### Solution 1
Notice that the bases of both triangles are diameters of the circle. Hence the ratio of the areas is just the ratio of the heights of the triangles, or $\frac{CF}{CD} (F$ is the foot of the [perpendicular](https://artofproblemsolving.com/wiki/index.php/perpendicular) from C to DE).

Call the radius r. Then AC = $\frac 13(2r) = \frac 23r, CO = \frac 13$r. Using the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) in $\triangle OCD,$ we get $\frac{1}{9}r^2 + CD^2 = $r^2 $\Longrightarrow CD = \frac{2\sqrt{2}}3$r.

Now we have to find CF. Notice $\triangle OCD \sim \triangle OFC,$ so we can write the [proportion](https://artofproblemsolving.com/wiki/index.php/proportion):

$$\frac{OF}{OC} = \frac{OC}{OD}$$

$$\frac{OF}{\frac{1}{3}r} = \frac{\frac{1}{3}r}{r}$$

$$OF = \frac 19r$$

By the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) in $\triangle OFC,$ we have $\left(\frac{1}{9}r\right)^2 + CF^2 = \left(\frac{1}{3}r\right)^2 \Longrightarrow CF = \sqrt{\frac{8}{81}r^2} = \frac{2\sqrt{2}}{9}$r.

Our answer is $\frac{CF}{CD} = \frac{\frac{2\sqrt{2}}{9}r}{\frac{2\sqrt{2}}{3}r} = \frac 13 \Longrightarrow \mathrm{(C)}.$
### Solution 2
Let the center of the circle be O.

Note that 2 $\cdot AC = BC \Rightarrow 3 \cdot AC = AB.$

O is midpoint of AB $\Rightarrow \frac{3}{2}AC = AO \Rightarrow CO = \frac{1}{3}AO \Rightarrow CO = \frac{1}{6} AB.$

O is midpoint of DE $\Rightarrow$ Area of $\triangle DCE = 2 \cdot$ Area of $\triangle DCO = 2 \cdot (\frac{1}{6} \cdot$ Area of $\triangle ABD) = \frac{1}{3} \cdot$ Area of $\triangle ABD \Longrightarrow \mathrm{(C)}.$
### Solution 3
Let r be the radius of the circle. Note that AC+BC = $2r$ so AC = $\frac{2}{3}$r.

By [Power of a Point Theorem](https://artofproblemsolving.com/wiki/index.php/Power_of_a_Point_Theorem), CD^2= AC $\cdot BC = 2\cdot AC^2,$ and thus CD = $\sqrt{2} \cdot AC = \frac{2\sqrt{2}}{3}$r

Then the area of $\triangle ABD$ is $\frac{1}{2} AB \cdot CD = \frac{2\sqrt{2}}{3}$r^2. Similarly, the area of $\triangle DCE$ is $\frac{1}{2}(r-AC) \cdot 2 \cdot CD = \frac{2\sqrt{2}}{9}r^2,$ so the desired ratio is $\frac{\frac{2\sqrt{2}}{9}r^2}{\frac{2\sqrt{2}}{3}r^2} = \frac{1}{3} \Longrightarrow \mathrm{(C)}$
### Solution 4
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2.5cm); defaultpen(fontsize(10pt)+linewidth(.8pt)); dotfactor=3; pair O=(0,0), C=(-1/3.0), B=(1,0), A=(-1,0); pair D=dir(aCos(C.x)), e=(-D.x,-D.y); pair H=(e.x,0); draw(A--B--D--cycle); draw(D--e--C); draw(unitcircle,white); drawline(D,C); dot(O); clip(unitcircle); draw(unitcircle); label("$E$",e,SSE); label("$B$",B,NE); label("$A$",A,W); label("$D$",D,NNW); label("$C$",C,SW); label("$H$",H,SE); draw(e--H,dashed); label("O",(0,0),NE); label("1",(C--O),N); label("1",(H--O),N); label("2",(A--C),N); label("2",(H--B),N); label("3",(O--D),NE); label("3",(O--e),NE); label("$\sqrt{2}$",(D--C),W); label("$\sqrt{2}$",(H--e),E); draw(rightanglemark(e,(e.x,0),A,2)); draw(rightanglemark(D,C,B,2));
```


Let the center of the circle be O.
Without loss of generality, let the radius of the circle be equal to 3. Thus, AO=3 and OB=3. As a consequence of $2(AC)$=BC, AC=2 and CO=1. Also, we know that DO and OE are both equal to 3 due to the fact that they are both radii. Thus from the Pythagorean Theorem, we have DC being equal to $\sqrt{3^2-1^2}$ or $2\sqrt{2}.$ Now we know that the area of [ABD] is equal to $\frac{(3+2+1)(2\sqrt{2})}{2}$ or $6\sqrt{2}.$ Know we need to find the area of [DCE]. By simple inspection [COD] \cong [HOE] due to angles being equal and CPCTC. Thus HE=$2\sqrt{2}$ and OH=1. Know we know the area of [CHE]=$\frac{(1+1)(2\sqrt{2})}{2}$ or $2\sqrt{2}.$ We also know that the area of [OHE]=$\frac{(1)(2\sqrt{2})}{2}$ or $\sqrt{2}.$ Thus the area of [COE]=$2\sqrt{2}-\sqrt{2}$ or $\sqrt{2}.$ We also can calculate the area of [DOC] to be $\frac{(1)(2\sqrt{2})}{2}$ or $\sqrt{2}.$ Thus [DCE] is equal to [COE] + [DOC]  or $\sqrt{2}+\sqrt{2}$ or $2\sqrt{2}.$ The ratio between [DCE] and  [ABD] is equal to $\frac{2\sqrt{2}}{6\sqrt{2}}$ or $\frac{1}{3} \Longrightarrow \mathrm{(C)}.$
### Solution 5
We will use the shoelace formula. Our origin is the center of the circle. Denote the ordered pair for D (x,y), and notice how E is a 180 degree rotation of D, using the rotation matrix formula we get E = (-x,-y). WLOG say that this circle has radius 3. We can now find points A, B, and C which are (-3,0), (3,0), and (-1,0) respectively.
By shoelace the area of CED is Y, and the area of ADB is 3Y. Using division we get that the answer is  $\mathrm{(C)}.$
### Solution 6 (Mass Points)
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Geogebra to Asymptote conversion, documentation at artofproblemsolving.com/Wiki go to User:Azjps/geogebra */ import graph; size(7cm); real labelscalefactor = 0.5; /* changes label-to-point distance */ pen dps = linewidth(0.7) + fontsize(10); defaultpen(dps); /* default pen style */ pen dotstyle = black; /* point style */ real xmin = -4.24313994860289, xmax = 6.360350402147026, ymin = -8.17642986522568, ymax = 4.1323989018072735; /* image dimensions */ pen wrwrwr = rgb(0.3803921568627451,0.3803921568627451,0.3803921568627451); /* draw figures */ draw(circle((0.9223776980185863,-1.084225871478444), 3.171161249925393), linewidth(2) + wrwrwr); draw((-0.5623104956355617,1.717909856970905)--(-0.39884850438732933,-3.9670413347199647), linewidth(2) + wrwrwr); draw((-2.2487343499798245,-1.1018908670262892)--(4.0935388680341624,-1.0849377800575102), linewidth(2) + wrwrwr); draw((-0.4813673187299407,-1.0971666418223938)--(2.1729847859273126,-3.904641555130568), linewidth(2) + wrwrwr); draw((-0.5623104956355617,1.717909856970905)--(2.1561002471522333,-3.887757016355488), linewidth(2) + wrwrwr); draw((-2.2487343499798245,-1.1018908670262892)--(-0.5623104956355617,1.717909856970905), linewidth(2) + wrwrwr); draw((-0.5623104956355617,1.717909856970905)--(4.0935388680341624,-1.0849377800575102), linewidth(2) + wrwrwr); draw(circle((-2.858607769046372,-1.1524617347926092), 0.45463011998128017), linewidth(2) + wrwrwr); draw(circle((4.790088296064635,-1.144019465405069), 0.45463011998128006), linewidth(2) + wrwrwr); draw(circle((-0.9168858099122313,-1.6336710898823752), 0.45463011998127983), linewidth(2) + wrwrwr); draw(circle((1.4976032349241348,-1.3128648531558642), 0.4546301199812797), linewidth(2) + wrwrwr); draw(circle((-0.815578577261755,2.334195522261307), 0.4546301199812809), linewidth(2) + wrwrwr); draw(circle((2.6119827940793803,-4.5546962979711285), 0.45463011998128033), linewidth(2) + wrwrwr); /* dots and labels */ dot((0.9223776980185863,-1.084225871478444),dotstyle); dot((-0.5623104956355617,1.717909856970905),dotstyle); label("$D$", (-0.49477234053524466,1.8867552447217006), NE * labelscalefactor); dot((-0.39884850438732933,-3.9670413347199647),dotstyle); dot((-2.2487343499798245,-1.1018908670262892),dotstyle); label("A", (-2.183226218043193,-0.9329627307165757), NE * labelscalefactor); dot((4.0935388680341624,-1.0849377800575102),dotstyle); label("B", (4.165360361386693,-0.9160781919414961), NE * labelscalefactor); dot((-0.4813673187299407,-1.0971666418223938),linewidth(4pt) + dotstyle); label("C", (-0.41034964665984724,-0.9667318082667347), NE * labelscalefactor); dot((2.1729847859273126,-3.904641555130568),dotstyle); dot((2.1561002471522333,-3.887757016355488),dotstyle); label("E", (2.2236384022525524,-3.7189116286046926), NE * labelscalefactor); label("2", (-2.9261459241466903,-1.2031153511178476), NE * labelscalefactor,wrwrwr); label("1", (4.722550140964316,-1.186230812342768), NE * labelscalefactor,wrwrwr); label("3", (-0.9844239650125497,-1.6758824368200735), NE * labelscalefactor,wrwrwr); label("4", (1.4300650798238166,-1.355076200093563), NE * labelscalefactor,wrwrwr); label("2", (-0.8831167323620728,2.2919841753236083), NE * labelscalefactor,wrwrwr); label("2", (2.5444446389790625,-4.5969076449088275), NE * labelscalefactor,wrwrwr); clip((xmin,ymin)--(xmin,ymax)--(xmax,ymax)--(xmax,ymin)--cycle); /* end of picture */
```


We set point A as a mass of 2. This means that point B has a mass of 1 since $2\times{AC} = 1\times{BC}.$ This implies that point C has a mass of $2+1 = 3$ and the center of the circle has a mass of $3+1 = 4$. After this, we notice that points D and E both must have a mass of 2 since $2+2 = 4$ and they are both radii of the circle.

To find the ratio of the areas, we do the reciprocal of the multiplication of the mass points of DCE and the multiplication of ABD divided by each other. Which is simply $\frac{3\times2\times2}{2\times2\times1}$ which is $\boxed{\frac{1}{3}} (t$he reciprocal of 3)

*~Brudder*
### Solution 7 (Slight Trigonometry)
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3.5cm); defaultpen(fontsize(12pt)+linewidth(.8pt)); dotfactor=3; pair O=(0,0), C=(-1/3.0), B=(1,0), A=(-1,0); pair D=dir(aCos(C.x)), E=(-D.x,-D.y); draw(A--B--D--cycle); draw(D--E--C); draw(unitcircle,white); drawline(D,C); dot(O); clip(unitcircle); draw(unitcircle); label("$E$",E,SSE); label("$B$",B,NE); label("$A$",A,W); label("$D$",D,NNW); label("$C$",C,SW); label("O",(0,0),NE); label("x",(C--O),N); label("$3x$",(B--O),N); label("$2x$",(A--C),N); label("$3x$",(O--D),NE); label("$3x$",(O--E),NE); label("$2x\sqrt{2}$",(D--C),W); draw(rightanglemark(D,C,B,2));
```


Let the center of the circle be O.
The area of ADB is $\frac{1}{2} \cdot 6x \cdot 2x\sqrt{2} = 6x^2\sqrt{2}.$ The area of DCE is $\frac{1}{2} \cdot DC \cdot DE \cdot$ sin CDE. We find sin CDE is $\frac{OC}{OD} = \frac{1}{3}.$ Substituting DC = $2x\sqrt{2}$ and DE = $6x$, we get [DCE] = $\frac{1}{2} \cdot 2x\sqrt{2} \cdot $6x $\cdot \frac{1}{3} = 2x^2\sqrt{2}.$ Hence, the ratio between the areas of DCE and ADB is equal to $\frac{2x^2\sqrt{2}}{6x^2\sqrt{2}}$ or $\frac{1}{3} = \boxed{(C)}.$

*~Math_Genius_164*
### Solution 8
In my opinion, the solution below is the easiest and quickest.

Since both DE and AB are diameters, they intersect at the center of the circle. Call this center O. WLOG, let AC=2, CO=1,OB=3. Call the point where the extension of DC hits the circle F. Notice that $\angle DCB = 90^\circ.$ This implies that DC=CF. WOLG, let DC=CF=1. Then, [DCE]=$\frac 12bh =\frac 12* DF*CO = \frac 12*2*1=1$ and [ABD]=$\frac 12bh =\frac 12*AB*CD = \frac 12*6*1 = 3$. Thus, the answer is $\frac{1}{3} = \boxed{(C)}.$

Solution by franzliszt
### Solution 9 (Slick construction)
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2.5cm); defaultpen(fontsize(10pt)+linewidth(.8pt)); dotfactor=3; pair O=(0,0), C=(-1/3.0), B=(1,0), A=(-1,0), X = (1/3.0); pair D=dir(aCos(C.x)), E=(-D.x,-D.y); draw(A--B--D--cycle); draw(D--E--C); draw(D--X); draw(unitcircle,white); drawline(D,C); dot(O); clip(unitcircle); draw(unitcircle); label("$E$",E,SSE); label("$B$",B,E); label("$A$",A,W); label("$D$",D,NNW); label("$C$",C,SW); label("$X$",X,NE); draw(rightanglemark(D,C,B,2));
```

Let X be the reflection of C over the center O. Since $\triangle DXO$\cong$\triangle ECO$ by SAS, it follows that the area of $\triangle DEC$ is equal to the area of $\triangle DCX.$ However, we know that
$$BC = 2AC\implies CO=\frac{1}{2}AC\implies CX=AC,$$
so the ratio of the area of $\triangle DEC$ to the area of $\triangle ABD$ is $\frac{\frac{AC\cdot DC}{2}}{\frac{3AC\cdot DC}{2}}=\frac{1}{3}\implies \boxed{(C)}$
## See also
