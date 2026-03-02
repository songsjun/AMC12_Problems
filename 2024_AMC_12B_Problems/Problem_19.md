# 2024 AMC 12B Problem 19

## Problem 19
Equilateral $\triangle ABC$ with side length 14 is rotated about its center by angle $\theta,$ where 0 < $\theta < 60^{\circ},$ to form $\triangle DEF.$ See the figure. The area of hexagon ADBECF is $91\sqrt{3}.$ What is $\tan\theta$?

> [Asymptote diagram - not rendered in Markdown]

```asy
// Credit to shihan for this diagram. defaultpen(fontsize(13)); size(200); pair O=(0,0),A=dir(225),B=dir(-15),C=dir(105),D=rotate(38.21,O)*A,E=rotate(38.21,O)*B,F=rotate(38.21,O)*C; draw(A--B--C--A,gray+0.4);draw(D--E--F--D,gray+0.4); draw(A--D--B--E--C--F--A,black+0.9); dot(O); dot("$A$",A,dir(A)); dot("$B$",B,dir(B)); dot("$C$",C,dir(C)); dot("$D$",D,dir(D)); dot("$E$",E,dir(E)); dot("$F$",F,dir(F));
```


$\textbf{(A)}~\frac{3}{4}\qquad\textbf{(B)}~\frac{5\sqrt{3}}{11}\qquad\textbf{(C)}~\frac{4}{5}\qquad\textbf{(D)}~\frac{11}{13}\qquad\textbf{(E)}~\frac{7\sqrt{3}}{13}$
## Solution 1
Let O be circumcenter of the equilateral triangle

Easily get OF = $\frac{14\sqrt{3}}{3}$

2 $\cdot (\triangle(OFC) + \triangle(OCE)) = OF^2 \cdot \sin(\theta) + OF^2 \cdot \sin(120 - \theta)$

$$
= \frac{14^2 \cdot 3}{9} ( \sin(\theta) + \sin(120 - \theta) )
= \frac{196}{3} ( \sin(\theta) + \sin(120 - \theta) )
$$

 = 2 $\cdot$ {$\frac{1}{3}$ } $\cdot(ADBECF) = 2\cdot \frac{91\sqrt{3}}{3}$


$$
\sin(\theta) + \sin(120 - \theta) = \frac{13\sqrt{3}}{14}
\sin(\theta) + \frac{ \sqrt{3}}{2}\cos( \theta) +\frac{ \sqrt{1}}{2}\sin( \theta) = \frac{13\sqrt{3}}{14}
\sqrt{3} \sin( \theta) + \cos( \theta) = \frac{13 }{7}
\cos( \theta) = \frac{13 }{7} - \sqrt{3} \sin( \theta)
\frac{169 }{49} - \frac{26\sqrt{3} }{7} \sin( \theta) + 4 \sin( \theta)^2 = 1
\sin( \theta) = \frac{5\sqrt{3} }{14} or \frac{4\sqrt{3} }{7}
$$

$\frac{4\sqrt{3} }{7}$  is invalid given $\theta \leq 60^\circ$  , $\sin(\theta ) < \sin( 60^\circ ) = \frac{\sqrt{3} }{2} = \frac{\sqrt{3} \cdot 3.5}{7}$

$$
\cos( \theta) = \frac{11 }{14}
\tan( \theta) = \frac{5\sqrt{3} }{11} \boxed{B }
$$


~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 2
From $\triangle ABC$'s side lengths of 14, we get
$$OF = OC = OE = \frac{14\sqrt{3}}{3}.$$
We let $\angle FOC = \theta$
And $\angle EOC = 120 - \theta$

The answer would be $3([$\triangle FOC$] + [$\triangle COE$])$

Which area $\triangle FOC = \frac{1}{2}\left(\frac{14\sqrt{3}}{3}\right)^2 \sin(\theta)$

And area $\triangle COE = \frac{1}{2}\left(\frac{14\sqrt{3}}{3}\right)^2 \sin(120 - \theta)$

So we have that

$$3\cdot \frac{1}{2}\cdot \left(\frac{14\sqrt{3}}{3}\right)^2 (\sin(\theta)+\sin(120 - \theta)) = 91\sqrt{3}$$


Which means

$$
\sin(\theta)+\sin(120 - \theta) = \frac{91\sqrt{3}}{98}
\frac{1}{2}\cos(\theta)+\frac{\sqrt{3}}{2}\sin(\theta) = \frac{91}{98}
\sin(\theta + 30) = \frac{91}{98}
\cos (\theta + 30) = \frac{21\sqrt{3}}{98}
\tan(\theta + 30) = \frac{91}{21\sqrt{3}} = \frac{91\sqrt{3}}{63}
$$


Now, $\tan(\theta)$ can be calculated using the addition identity, which gives the answer of

$$\boxed{\text{(B) }\frac{5\sqrt{3}}{11}}.$$

*~mitsuihisashi14*
~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso] (fixed Latex error )
## Solution 3 (No Trig Manipulations)
> [Asymptote diagram - not rendered in Markdown]

```asy
// Modified Asymptote diagram with correct right angle mark and alpha label. import olympiad; defaultpen(fontsize(13)); size(200); // Circumradius R = 14*sqrt(3)/3 real R = 14*sqrt(3)/3; // Define original points with scaling pair O = (0,0); pair A = R * dir(225); pair B = R * dir(-15); pair C = R * dir(105); pair D = rotate(38.21, O) * A; pair E = rotate(38.21, O) * B; pair F = rotate(38.21, O) * C; // Point H: Foot of altitude from B to DE pair $DE_vec$ = E - D; pair perp_DE = ($DE_vec$.y, -$DE_vec$.x); // Rotate -90 degrees perp_DE = perp_DE / length(perp_DE); // Unit vector pair H = B - (2*sqrt(3)) * perp_DE; // Corrected direction // Point M: Extend BH to M, BM = 13*sqrt(3)/3 pair $BH_vec$ = H - B; pair $BM_unit$ = $BH_vec$ / length$(BH_vec)$; // Unit vector along BH pair M = B + (13*sqrt(3)/3) * $BM_unit$; // BM = 13*sqrt(3)/3 // Point P: Midpoint of BE pair P = (B + E) / 2; // Draw original triangles and polygon draw(A--B--C--A, gray+0.4); draw(D--E--F--D, gray+0.4); draw(A--D--B--E--C--F--A, black+0.9); // Draw new dashed segments draw(B--H, black+0.7+dashed); draw(H--M, black+0.7+dashed); draw(O--M, black+0.7+dashed); draw(O--P, black+0.7+dashed); draw(P--E, black+0.7+dashed); draw(O--B, black+0.7+dashed); // Draw right angle marker at OMB draw(rightanglemark(B, M, O, 15)); // Right angle at M, size 15 // Draw dots and labels dot(O); dot("$O$", O, dir(180)); dot("$A$", A, dir(A)); dot("$B$", B, dir(B)); dot("$C$", C, dir(C)); dot("$D$", D, dir(D)); dot("$E$", E, dir(E)); dot("$F$", F, dir(F)); dot("$H$", H, dir(270)); dot("$M$", M, dir(90)); dot("$P$", P, dir(0)); // Label angle POB as alpha, to the right of O draw(anglemark(B, O, P, 50)); // Angle mark at O label("$\alpha$", O + (1.5, -.23), dir(0)); // Position to the right of O
```


Let the circumcenter of the circle inscribing this polygon be O. The area of the equilateral triangle is $\frac{\sqrt{3}}{4}*196=49\sqrt{3}.$ The area of one of the three smaller triangles, say $\triangle{DBE}$ is $14\sqrt{3}.$ Let BH be the altitude of $\triangle{DBE},$ so if we extend BH to point M where MO\perp{BM}, we get right triangle $\triangle{OMB}.$ Note that the height BH=$2\sqrt{3},$ computed given the area and side length 14, so MB=MH+HB=$\frac{7\sqrt{3}}{3}+2\sqrt{3}=\frac{13\sqrt{3}}{3}. OB=\frac{14\sqrt{3}}{3}$ so Pythag gives OM=$\sqrt{OB^2-MB^2}=3.$ This means that HE=7-OM=4, so Pythag gives BE=$2\sqrt{7}.$ Let $\frac{\theta}{2}=\alpha$ and the midpoint of BE be P so that BP=PE=$\sqrt{7},$ so that Pythag on $\triangle{OPE}$ gives OP=$\sqrt{OE^2-PE^2}=\sqrt{\frac{175}{3}}.$ Then $\tan{\alpha}=\frac{\sqrt{7}}{\sqrt{\frac{175}{3}}}=\frac{\sqrt{3}}{5}.$ Then $\tan{2\alpha}=\tan{\theta}=\frac{\frac{2\sqrt{3}}{5}}{1-\frac{3}{25}}=\boxed{\frac{5\sqrt{3}}{11}}.$

*~Magnetoninja*
## Solution 4
[$\triangle ABD$] = $\frac{[ADBECF]-[\triangle ABC]}{3} = \frac{91\sqrt{3}-49\sqrt{3}}{3} = 14\sqrt{3}$

Let M be the intersection of AB and DE. Since DMB is isosceles and $\angle AMD = \theta,$ we have $\angle ABD = \theta/2$. Also, all of the hexagon's internal angles are equal, so $\angle ADB = 120^\circ.$

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(fontsize(13)); size(220); // Base points and rotation pair O = (0,0); pair A = dir(225); pair B = dir(-15); pair D = rotate(38.21, O)*A; pair E = rotate(38.21, O)*B; // Intersection point of AB and DE pair M = extension(A, B, D, E); // Triangle and segments defaultpen(fontsize(13)); size(220); // Base triangle from rotated figure pair O = (0,0); pair A = dir(225); pair B = dir(-15); pair D = rotate(38.21, O)*A; pair E = rotate(38.21, O)*B; // M is intersection of AB and DE pair M = extension(A, B, D, E); // Draw triangle and segment draw(A--B--D--cycle, black+0.9); draw(D--M, gray + dashed); // Draw angle theta at AMD real $r = 0.1$; path thetaArc = arc(M, r, degrees(D - M), degrees(A - M)); draw(thetaArc, gray); label("$\theta$", M + ($r+0$.1)*dir((degrees(D - M) + degrees(A - M))/2), gray); // Draw congruence ticks on MB and MD pair u1 = unit(B - M), u2 = unit(D - M); pair tick1a = midpoint(M--B) + rotate(90)*u1 * 0.04; pair tick1b = midpoint(M--B) + rotate(-90)*u1 * 0.04; pair tick2a = midpoint(M--D) + rotate(90)*u2 * 0.04; pair tick2b = midpoint(M--D) + rotate(-90)*u2 * 0.04; draw(tick1a--tick1b, gray); draw(tick2a--tick2b, gray); // Labels dot("$A$", A, dir(A)); dot("$B$", B, dir(B)); dot("$D$", D, dir(D)); dot("$M$", M, N);
```

Using the side-angle-side area formula:

$$14\sqrt{3} = \frac{1}{2} \cdot 14 \cdot BD \cdot \sin\left(\frac{\theta}{2}\right) \Rightarrow BD = \frac{2\sqrt{3}}{\sin(\theta/2)}.$$


Apply Law of Sines on $\triangle ABD$ with $\angle DAB = 60^\circ - \theta/2$:

$$
\frac{14}{\sin 120^\circ} = \frac{BD}{\sin(60^\circ - \theta/2)}
\frac{28}{\sqrt{3}} = \frac{2\sqrt{3}}{\sin(\theta/2)\sin(60^\circ - \theta/2)}.
\sin(\theta/2)\sin(60^\circ - \theta/2) = \frac{3}{14}.
$$

Using trig identities:

$$
\sqrt{\frac{1-\cos(\theta)}{2}} \cdot (\sin(60^\circ)\cos(\theta/2) - \sin(\theta/2)\cos(60^\circ)) = \frac{3}{14}
\sqrt{\frac{1-\cos(\theta)}{2}} \cdot \left(\frac{\sqrt{3}}{2}\cos(\theta/2) - \frac{1}{2}\sin(\theta/2)\right) = \frac{3}{14}
\sqrt{\frac{1-\cos(\theta)}{2}} \cdot \left(\frac{\sqrt{3}}{2} \sqrt{\frac{1+\cos(\theta)}{2}} - \frac{1}{2} \sqrt{\frac{1-\cos(\theta)}{2}} \right) = \frac{3}{14}
\left(\frac{\sqrt{3}}{2}\sqrt{\frac{1-\cos^2(\theta)}{4}} - \frac{1}{2}\left(\frac{1-\cos(\theta)}{2}\right)\right) = \frac{3}{14}
\frac{\sqrt{3}\sin\theta}{4} - \frac{(1-\cos\theta)}{4} = \frac{3}{14}
\sqrt{3}\sin\theta + \cos\theta = \frac{13}{7}
\cos\theta = \frac{13}{7} - \sqrt{3}\sin\theta.
$$


Substitute into $\sin^2\theta + \cos^2\theta = 1$:

$$
\left(\frac{13}{7} - \sqrt{3}\sin\theta\right)^2 + \sin^2\theta = 1.
4\sin^2\theta - \frac{26\sqrt{3}}{7}\sin\theta + \frac{120}{49} = 0.
$$


Solving:
$\sin\theta = \frac{5\sqrt{3}}{14} \quad (\text{valid root}), \quad \cos\theta = \frac{11}{14} \Rightarrow \tan\theta = \frac{5\sqrt{3}}{11}.$

$$\boxed{\text{(B) }\frac{5\sqrt{3}}{11}}$$
*~sparkycat (ttm)*
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=akLlCXKtXnk
## See also
