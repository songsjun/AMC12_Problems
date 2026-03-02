# 2017 AMC 12A Problem 24

## Problem
Quadrilateral ABCD is inscribed in circle O and has side lengths AB=3, BC=2, CD=6, and DA=8. Let X and Y be points on $\overline{BD}$ such that $\frac{DX}{BD} = \frac{1}{4}$ and $\frac{BY}{BD} = \frac{11}{36}.$
Let E be the intersection of line AX and the line through Y parallel to $\overline{AD}.$ Let F be the intersection of line CX and the line through E parallel to $\overline{AC}.$ Let G be the point on circle O other than C that lies on line CX. What is XF$\cdot XG$?

$\textbf{(A) }17\qquad\textbf{(B) }\frac{59 - 5\sqrt{2}}{3}\qquad\textbf{(C) }\frac{91 - 12\sqrt{3}}{4}\qquad\textbf{(D) }\frac{67 - 10\sqrt{2}}{3}\qquad\textbf{(E) }18$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
size(8cm); real $r = 4.01754$; draw(circle((0,0), r)); pair C = r * dir(-30), B = r * dir(28.83-30), A = r * dir(72.68-30), D = r * dir(241.98-30); draw(A--B--C--D--cycle); draw(B--D); pair X = B * 1/4 + D * 3/4, Y = B * 25/36 + D * 11/36; label("A", A, N); label("B", B, NE); label ("C", C, E); label("D", D, S); label("Y", Y, N); label("X", X, N); pair G = X * 1.445 - C*0.445; label("G", G, NW); pair E = Y + (D - A) * 1.48; draw(Y--E); draw(A--E); label("E", E, S); pair F = E + (A - C) * 1.45; draw(C--F--E); label("F",F,NW);
```

*~raxu, put in by fuzimiao2013*
## Solution 1
Using the given ratios, note that $\frac{XY}{BD} = 1 - \frac{1}{4} - \frac{11}{36} = \frac{4}{9}.$

By AA Similarity, $\triangle AXD \sim \triangle EXY$ with a ratio of $\frac{DX}{XY} = \frac{9}{16}$ and $\triangle ACX \sim \triangle EFX$ with a ratio of $\frac{AX}{XE} = \frac{DX}{XY} = \frac{9}{16},$ so $\frac{XF}{CX} = \frac{16}{9}.$

Now we find the length of BD. Because the quadrilateral is cyclic, we can simply use the Law of Cosines. BD^2=3^2+8^2-$48\cos\angle BAD=2^2+6^2-24\cos (180-\angle BAD)=2^2+6^2+24\cos\angle BAD\rightarrow \cos\angle BAD = \frac{11}{24}\rightarrow BD=\sqrt{51}$
By Power of a Point, CX$\cdot XG = DX\cdot XB = \frac{\sqrt{51}}{4} \frac{3\sqrt{51}}{4}.$ Thus XF$\cdot XG = \frac{XF}{CX} CX\cdot XG = \frac{51}{3} = \boxed{\textbf{(A)}\ 17}.$

*~solution by FRaelya*
## Solution 2
We shall make use of the pairs of similar triangles present in the problem, Ptolemy's Theorem, and Power of a Point.
Let Z be the intersection of AC and BD. First, from ABCD being a cyclic quadrilateral, we have that $\triangle BCZ \sim \triangle AZD, \triangle BZA \sim \triangle CDZ.$ Therefore, $\frac{2}{BZ} = \frac{8}{AZ}, \frac{6}{CZ} = \frac{3}{BZ},$ and $\frac{2}{CZ} = \frac{8}{DZ},$ so we have BZ = $\frac{1}{2}CZ, AZ = 2CZ,$ and DZ = 4CZ. By Ptolemy's Theorem, (AB)(CD) + (BC)(DA) = (AC)(BD) = (AZ + ZC)(BZ + ZD) $\rightarrow 3 \cdot 6 + 2 \cdot 8 = 34 = \left(2CZ + ZC\right)\left(\frac{1}{2}CZ + 4CZ\right) = \frac{27}{2}CZ^2.$ Thus, CZ^$2 =\frac{68}{27}.$ Then, by Power of a Point, GX $\cdot XC = BX \cdot XD = \frac{3}{4} \cdot \frac{1}{4}BD^2 = \frac{3}{16} \cdot \left(\frac{9}{2}CZ\right)^2 = \frac{9 \cdot 17}{16}.$ So, XG = $\frac{9 \cdot 17}{16XC}.$
Next, observe that $\triangle ACX \sim \triangle EFX,$ so $\frac{XE}{XF} = \frac{AX}{XC}.$ Also, $\triangle{AXD} \sim \triangle{EXY},$ so $\frac{8}{AX} = \frac{EY}{XE}.$ We can compute EY = $\frac{128}{9}$ after noticing that XY = BD - BY - DX = BD - $\frac{11}{36}BD - \frac{1}{4}BD = \frac{4}{9}BD$ and that $\frac{8}{DX} = \frac{32}{BD} = \frac{EY}{XY} = \frac{EY}{\frac{4}{9}BD}.$ So, $\frac{8}{AX} = \frac{128}{9XE}.$ Then, $\frac{XE}{AX} = \frac{XF}{XC} = \frac{16}{9} \rightarrow XF = \frac{16}{9}XC.$

Multiplying our equations for XF and XG yields that XF $\cdot XG = \frac{9 \cdot 17}{16XC} \cdot \frac{16}{9}XC = \boxed{\textbf{(A)}\ 17}.$
## Solution 3
Denote P to be the intersection between line AE and circle O. Note that $\angle GFE = \angle ACG = \angle APG = 180 - \angle GPE,$ making $\angle GFE + \angle GDE = 180.$ Thus, PEFG is a cyclic quadrilateral. Using [Power of a Point](https://artofproblemsolving.com/wiki/index.php/Power_of_a_Point) on X gives XP $\cdot XE = XG \cdot XF.$

Since $\triangle ADX \sim \triangle EYX$ and $\triangle ACX \sim \triangle EFX, AX$/XE = XD/YX = 9/16. Using Power of a Point on X again, (AX)(PX) = (BX)(DX). Plugging in AX=9/16 XE gives:
$$\dfrac{9}{16}(XE)(PX) = (BX)(DX) = \dfrac{9}{16}(FX)(GX)$$
By [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines), we can find BD = $\sqrt{51},$ as in Solution 1. Now, BX = 3/4 ($\sqrt{51})$ and DX = 1/4 ($\sqrt{51}),$ making $\dfrac{9}{16}(FX)(GX) = \left( \dfrac{\sqrt{51}}{4}\right)\left( \dfrac{3\sqrt{51}}{4}\right) = \dfrac{3(51)}{16}.$ This gives us FX $\cdot GX = \boxed{\textbf{(A)}\ 17}$ as a result.

*~Solution by sml1809*
### Note
You could have also got the relation XP $\cdot XE = XG \cdot XF$ as follows: From the similarities, AX/XE = CX/XF = 9/16. PoP on X gives (AX)(PX) = (CX)(GX). Plugging in AX = 9/16 XE and CX=9/16 FX gives
$$9/16 (XE)(PX) = 9/16(FX)(GX),$$
implying that (XP)(XE) = (XG)(XP).

*~sml1809*
## Solution 4

$$\because AC \parallel EF, \quad \therefore \triangle ACX \sim \triangle EFX, \quad \frac{XF}{XC} = \frac{XE}{XA}$$


By Power of a Point, XG $\cdot XC = XD \cdot XB$

By multiplying the 2 equations we get XF $\cdot XG = \frac{XE}{XA} \cdot XD \cdot XB$


$$\because YE \parallel AD, \quad \therefore \triangle EYX \sim \triangle ADX, \quad \frac{XD}{XY} = \frac{XA}{XE}, \quad XD \cdot XE = XA \cdot XY, \quad XD = \frac{XA \cdot XY}{XE}$$


By substitution, XF $\cdot XG = \frac{XE}{XA} \cdot \frac{XA \cdot XY}{XE} \cdot XB = XY \cdot XB = \frac{4}{9} BD \cdot \frac{3}{4} BD = \frac{BD^2}{3}$

Let a = AB, b = BC, c = CD, d = AD, p = AC, and q = BD

By Ptolemy's theorem, p $\cdot$ q = a $\cdot$ c + b $\cdot$ d

[ABD] = $\frac12 \cdot$ ad $\cdot \sin A, \quad$ [BCD] = $\frac12 \cdot$ bc $\cdot \sin C = \frac12 \cdot$ bc $\cdot \sin A$

[ABC] = $\frac12 \cdot$ ab $\cdot \sin B, \quad$ [ACD] = $\frac12 \cdot$ cd $\cdot \sin D = \frac12 \cdot$ cd $\cdot \sin B$

[ABCD] = [ABD] + [BCD] = $\frac12 \cdot$ ad $\cdot \sin A + \frac12 \cdot$ bc $\cdot \sin A = \frac12 (ad + bc) \sin A$

[ABCD] = [ABC] + [ACD] = $\frac12 \cdot$ ab $\cdot \sin B + \frac12 \cdot$ cd $\cdot \sin B = \frac12 (ab + cd) \sin B$


$$\frac{ab + cd}{ad + bc} = \frac{ \sin A }{ \sin B} = \frac{ \frac{q}{2R} }{ \frac{p}{2R} } = \frac{q}{p}, \quad p = \frac{q(ad + bc)}{ab + cd}$$


$$\frac{q(ad + bc)}{ab + cd} \cdot q = ac + bd$$


$$BD^2 = q^2 = \frac{ (ac + bd)(ab + cd) }{ad + bc} = \frac{(3 \cdot 6 + 2 \cdot 8)(3 \cdot 2 + 6 \cdot 8)}{3 \cdot 8 + 2 \cdot 6} = 51$$


$$XF \cdot XG = \frac{51}{3} = \boxed{\textbf{(A) } 17}$$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=JdERP0d0W64&list=PLyhPcpM8aMvLZmuDnM-0vrFniLpo7Orbp&index=4
- AMBRIGGS
## See Also
