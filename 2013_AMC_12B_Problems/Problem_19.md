# 2013 AMC 12B Problem 19

> This problem is the same as [2013 AMC 12B #19](https://artofproblemsolving.com/wiki/index.php/2013_AMC_12B_Problems) and [2013 AMC 10B #23](https://artofproblemsolving.com/wiki/index.php/2013_AMC_10B_Problems).
## Problem
In triangle ABC, AB=13, BC=14, and CA=15. Distinct points D, E, and F lie on segments $\overline{BC}, \overline{CA},$ and $\overline{DE},$ respectively, such that $\overline{AD}$\perp$\overline{BC}, \overline{DE}$\perp$\overline{AC},$ and $\overline{AF}$\perp$\overline{BF}.$ The length of segment $\overline{DF}$ can be written as $\frac{m}{n},$ where m and n are relatively prime positive integers. What is m+n?

$\textbf{(A)}\ 18\qquad\textbf{(B)}\ 21\qquad\textbf{(C)}\ 24\qquad\textbf{(D)}\ 27\qquad\textbf{(E)}\ 30$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); defaultpen(linewidth(0.4)+fontsize(10)); pen s = linewidth(0.8)+fontsize(8); pair A,B,C,D,E0,F,G; A = origin; C = (15,0); B = IP(CR(A,13),CR(C,14)); D = foot(A,C,B); E0 = foot(D,A,C); F = OP(CR((A+B)/2,length(B-A)/2), D--E0); draw(A--C--B--A, black+0.8); draw(B--F--A--D--E0); dot("$A$",A,W); dot("$B$",B,N); dot("$C$",C,E); dot("$D$",D,NE); dot("$E$",E0,S); dot("$F$",F,E); draw(rightanglemark(B,D,A,15)); draw(rightanglemark(B,F,A,15)); draw(rightanglemark(D,E0,A,15)); label("$5$",D--B,NE); label("$9$",D--C,NE); label(Label("$13$",Rotate(B-A)), B--A);
```
## Solution 1
Since $\angle{AFB}=\angle{ADB}=90^{\circ},$ quadrilateral ABDF is cyclic. It follows that $\angle{ADE}=\angle{ABF},$ so $\triangle ABF \sim \triangle ADE$ are similar. In addition, $\triangle ADE \sim \triangle ACD.$ We can easily find AD=12, BD = 5, and DC=9 using Pythagorean triples.

So, the ratio of the longer leg to the hypotenuse of all three similar triangles is $\tfrac{12}{15} = \tfrac{4}{5},$ and the ratio of the shorter leg to the hypotenuse is $\tfrac{9}{15} = \tfrac{3}{5}.$ It follows that AF=($\tfrac{4}{5}\cdot 13), BF=(\tfrac{3}{5}\cdot 13).$

Let x=DF. By [Ptolemy's Theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_Theorem), we have $13x+\left(5\cdot 13\cdot \frac{4}{5}\right)= 12\cdot 13\cdot \frac{3}{5} \qquad$\Leftrightarrow $\qquad 13$x+52=93.6. Dividing by 13 we get $x+4=7.2\impliesx=\frac{16}{5}$ so our answer is $\boxed{\textbf{(B) }21}.$

*~Edits by BakedPotato66*
## Solution 2
From solution 1, we know that AD = 12 and DC = 9. Since $\triangle ADC \sim \triangle DEC,$ we can figure out that DE = $\frac{36}{5}.$ We also know what AC is so we can figure what AE is: AE = 15 - $\frac{27}{5} = \frac{48}{5}$ . Quadrilateral ABDF is cyclic, implying that $\angle{B} + \angle{DFA} = 180$°. Therefore, $\angle{B} = 180 - \angle{DFA} = \angle{EFA},$ and triangles $\triangle AEF \sim \triangle ADB.$ Solving the resulting proportion gives EF = 4. Therefore, DF = ED - EF = $\frac{16}{5}.$ m + $n =16 + 5 = 21$ and our answer is $\boxed{\textbf{(B) } 21}.$

$\triangle ADC \sim \triangle DEC$ because of AA $\sim$ . $\angle{ADC} = \angle{DEC} = 90$°. Lets say $\angle{ADE} =$ x. So  $\angle{EDC} = 90 -$ x and $\angle{DEC} = 180 - 90 - (90 - x) =$ x so $\angle{ADE} = \angle{DEC}$

~[https://artofproblemsolving.com/wiki/index.php/User:South South]
## Solution 3
Let $\angle{ADF} = \theta,$ and DF = x. Noting that AD is the altitude from A to BC, AD=12, BD = 5, and DC = 9. Notice that since DE is perpendicular to AC, $\triangle{ADC}$ is similar to $\triangle{AEC}.$ Therefore since $\triangle{ADC}$ is a 3-4-5 triangle, $\cos{\theta}=\frac{3}{5}.$
Applying Law of Cosines on $\triangle{ADF}$ we have,AF^2 = 144+x^2 - $2\cdot 12 \cdot$ x $\cdot \cos{\theta} = 144+x^2 - \frac{72x}{5}.$ Next notice that $\cos{\angle{BDF}} = \cos{(90 + \theta)} = -\sin{\theta} = \frac{-4}{5}.$ Now we apply Law of Cosines on $\triangle{BDF},$
$BF^2 = 25 + x^2 - 2 \cdot 5 \cdot$ x $\cdot \cos{\angle{BDF}} = 25 +x^2 +8x$.
Finally using Pythagorean Theorem on $\triangle{ABF}$ we have, AB^2 = AF^2 + BF^2. 13^2 = 144+x^2 - $\frac{72x}{5} + 25 +x^2 + 8x.0 =2x^2-\frac{32x}{5}.$ Solving for the nonnegative value for x we find x = DF = $\frac{16}{5} \implies \boxed{21}.$

*~mathkiddus*
## Solution 4
If we draw a diagram as given, but then add point G on $\overline{BC}$ such that $\overline{FG}$\perp$\overline{BC}$ in order to use the Pythagorean theorem, we end up with similar triangles $\triangle{DFG}$ and $\triangle{DCE}.$ Thus, FG=$\tfrac35$x and DG=$\tfrac45$x, where x is the length of $\overline{DF}.$ Using the Pythagorean theorem, we now get BF = $\sqrt{\left(\frac45x+ 5\right)^2 + \left(\frac35x\right)^2}$ and AF can be found out noting that AE is just $\tfrac{48}5$ through base times height (since $12\cdot 9 = 15 \cdot \tfrac{36}5,$ similar triangles gives AE = $\tfrac{48}5),$ and that EF is just $\tfrac{36}5 -$ x.  From there, AF = $\sqrt{\left(\frac{36}5 - x\right)^2 + \left(\frac{48}5\right)^2}.Now, BF^2 + AF^2 = 169,$ and squaring and adding both sides and subtracting a 169 from both sides gives $2x^2-\tfrac{32}5$x = 0, so $x =\tfrac{16}5.$ Thus, the answer is $\boxed{\textbf{(B)}}.$
## Solution 5 (Power of a Point)
First, we find BD = 5, DC = 9, and AD = 12 via the Pythagorean Theorem or by using similar triangles. Next, because DE is an altitude of triangle ADC, DE = $\frac{AD\cdot DC}{AC} = \frac{36}{5}.$ Using that, we can use the Pythagorean Theorem and similar triangles to find EC = $\frac{27}{5}$ and AE = $\frac{48}{5}.$

Points A, B, D, and F all lie on a circle whose diameter is AB. Let the point where the circle intersects AC be G. Using power of a point, we can write the following equation to solve for AG: DC$\cdot BC = CG\cdot AC 9\cdot 14 = CG\cdot 15 CG = 126/15$ Using that, we can find AG = $\frac{99}{15},$ and using AG, we can find that GE = 3.

We can use power of a point again to solve for DF: FE$\cdot DE = GE\cdot AE (\frac{36}{5} - DF)\cdot \frac{36}{5} = 3 \cdot \frac{48}{5} \frac{36}{5} - DF = 4 DF = \frac{16}{5} = \frac{m}{n}$ Thus, $m+n =16+5 = 21\boxed{\textbf{(B)}}.$
## Solution 6 (Coord Bash)
If we draw the diagram like above, but make BC the base, we can set B(0,0), C(14,0) and A(5,12), as AD can quickly be verified to be 12 by Pythagorean triples or similar triangles. Construct X on BC such that EX \perp BC. This implies $\triangle ADC \sim \triangle EXC$ as AD \parallel EX, and  $\angle ACD = \angle ECX$ . Also construct FY such that FY \perp BC.

Line $\overline$ {AC} has a slope of $-\frac{4}{3}$ by slope formula. Since D = (5,0) and DE \perp AC,, the equation of  DE = $\frac{3}{4}$x - $\frac{15}{4}.$

Furthermore, F can now be expressed as (x,$\frac{3}{4}$x - $\frac{15}{4}).$ Since we know AF \perp BF, we can solve for x with the perpendicular slope formula like so: $\frac{\frac{3}{4}x - \frac{63}{4}}{x - 5} \cdot \frac{\frac{3}{4}x - \frac {15}{4}}{x} = -1 \frac{x-21}{x-5} \cdot \frac{x-5}{x} = -\frac{16}{9} \frac{x-21}{x} = -\frac{16}{9}  9x = 189 -16xx =\frac{189}{25}$

Plugging $\frac{189}{25}$ into F, we get F($\frac{189}{25},\frac{48}{25}).$ Since FY \perp DY, we get that $\triangle FYD$ has side lengths of FY = $\frac{48}{25}$

and DY = BY - BD = BY - 5 = $\frac{64}{25}.$

Clearly, $\triangle FYD$ is a 3 - 4 - 5 pythagorean triple, so DF = $\frac{80}{25} = \frac{16}{5}.$

$$16 + 5 = m + n = \boxed{\textbf{(B) }21}.$$

*~JT0543164*
## Solution 7 (Fakesolve)
We assume that triangle $ABF$ is a 30-60-90 triangle, and $E$ and $F$ is the midpoint of $AC$ and $DE$ respectively.

Then, length $BF$ is $\frac{13}{2}$, and length $AF$ is $\frac{13\sqrt{3}}{2}$.

If $E$ is the midpoint of $AC$ and $AC=15$, then $AE = \frac{15}{2}$. We see that $\triangle DAE$ is a right angle triangle with hypotenuse $\frac{13\sqrt{3}}{2}$, so

$$AE^2 + EF^2 = AF^2$$


$$\Rightarrow \left(\frac{15}{2}\right)^2 + EF^2 = \left(\frac{13\sqrt{3}}{2}\right)^2$$


$$\Rightarrow \frac{225}{4} + EF^2 = \frac{13^2 \cdot 3}{4}$$

$$\Rightarrow \frac{225}{4} + EF^2 = \frac{507}{4}$$

$$\Rightarrow EF^2 = \frac{507}{4} - \frac{225}{4}$$

$$\Rightarrow EF^2 = \frac{282}{4}$$

$$\Rightarrow EF \approx \frac{16.8}{2}$$

We know that while $E$ and $F$ are not exactly the midpoints of $AC$ and $DE$, and therefore the lengths $DF$ would be a smaller fraction, and $m+n$ would be bigger. So, we take the nearest answer choice which is $\boxed{\textbf{(B) }21}.$

*~Pinotation*
## Video Solution by Pi Academy
https://youtu.be/2wrOFzxYCcM?si=J-u-_5Yb8o3hXrAp

*~Pi Academy*
## Video Solution 2
https://www.youtube.com/watch?v=X0YJfFiBy0g

https://youtu.be/XZBKnobK-JU?t=3064
## See also
