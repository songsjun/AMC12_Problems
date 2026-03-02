# 2024 AMC 12A Problem 19

## Problem
Cyclic quadrilateral ABCD has lengths BC=CD=3 and DA=5 with $\angle CDA=120^\circ.$ What is the length of the shorter diagonal of ABCD?

$\textbf{(A) }\frac{31}7 \qquad \textbf{(B) }\frac{33}7 \qquad \textbf{(C) }5 \qquad \textbf{(D) }\frac{39}7 \qquad \textbf{(E) }\frac{41}7 \qquad$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
import geometry; size(200); pair A = (-1.66, 0.33); pair B = (-9.61277, 1.19799); pair C = (-7.83974, 3.61798); pair D = (-4.88713, 4.14911); draw(circumcircle(A, B, C)); draw(A--C); draw(A--D); draw(C--D); draw(B--C); draw(A--B); label("$A$", A, E); label("$B$", B, W); label("$C$", C, NW); label("$D$", D, N); label("$7$", midpoint(A--C), SW); label("$5$", midpoint(A--D), NE); label("$3$", midpoint(C--D)+ dir(135)*0.3, N); label("$3$", midpoint(B--C)+dir(180)*0.3, NW); label("$8$", midpoint(A--B), S); markangle(Label("$\circ$", Relative(0.5)), A, B, C, radius=10); markangle(Label("$\circ$", Relative(0.5)), C, D, A, radius=10);
```

*~diagram by erics118*

First, $\angle CBA=60 ^\circ$ by properties of cyclic quadrilaterals.

Let AC=u. Apply the [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines) on $\triangle ACD$:

$$
u^2=3^2+5^2-2(3)(5)\cos120^\circ
u=7
$$


Let AB=v. Apply the Law of Cosines on $\triangle ABC$:

$$
7^2=3^2+v^2-2(3)(v)\cos60^\circ
v=\frac{3\pm13}{2}
v=8
$$


By [Ptolemy’s Theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy’s_Theorem),

$$
AB \cdot CD+AD \cdot BC=AC \cdot BD
8 \cdot 3+5 \cdot 3=7BD
BD=\frac{39}{7}
$$

Since $\frac{39}{7}<7,$
The answer is $\boxed{\textbf{(D) }\frac{39}{7}}.$

*~lptoggled,eevee9406, meh494*
## Solution 2 (Law of Cosines + Law of Sines)
Draw diagonals AC and BD. By Law of Cosines,

$$
\begin{align*}
AC^2&=3^2 + 5^2 - 2(3)(5)\cos \left(\frac{2\pi}{3} \right) \\
&= 9+25 +15 \\
&=49.
\end{align*}
$$

Since AC is positive, taking the square root gives AC=7. Let $\angle BDC=\angle CBD=x.$ Since $\triangle BCD$ is isosceles, we have $\angle BCD=180-2$x. Notice we can eventually solve BD using the Extended Law of Sines: $\frac{BD}{\sin(180-2x)}=2$r, where r is the radius of the circumcircle ABCD. Since $\sin(180-2x)=\sin(2x)=2\sin(x)\cos(x),$ we simply our equation: $\frac{BD}{2\sin(x)\cos(x)}=2$r.
Now we just have to find $\sin(x), \cos(x),$ and $2r$. Since ABCD is cyclic, we have $\angle CBD = \angle CAD =$ x. By Law of Cosines on $\triangle ADC,$ we have  $3^2=7^2 + 5^2 -70\cos(x).$ Thus, $\cos(x)=\frac{13}{14}.$ Similarly, by Law of Sines on $\triangle ACD,$ we have $\frac{7}{\sin\left(\frac{2\pi}{3} \right)}=2$r. Hence, $2r=\frac{14\sqrt3}{3}.$ Now, using Law of Sines on $\triangle BCD,$ we have $\frac{3}{\sin(x)}=2r= \frac{14\sqrt3}{3},$ so $\sin(x)=\frac{3\sqrt3}{14}.$ Therefore, $\frac{BD}{2\left(\frac{3\sqrt3}{14}\right) \left(\frac{13}{14} \right)}=\frac{14\sqrt3}{3}.$ Solving, BD = $\frac{39}{7},$ so the answer is $\boxed{\textbf{(D) }\frac{39}{7}}.$

*~evanhliu2009*
## Solution 3 (Law of Cosines + Cyclic Quadrilateral Property)
Draw diagonals AC and BD. First, use Law of Cosines to get that

$$
\begin{align*}
AC^2&=3^2 + 5^2 - 2(3)(5)\cos(120^{\circ}) \\
&= 9+25+15 \\
&=49.
\end{align*}
$$

Thus, AC=7. Since ABCD is cyclic, $\angle CAD = \angle CBD,$ so Law of Cosines once again with respect to $\angle CAD$ on triangle ACD leads to

$$
\begin{align*}
9&=5^2+7^2-2(7)(5)\cos\theta \\
&= 74-70\cos\theta. \\
\end{align*}
$$

Solving yields $\cos\theta=\frac{13}{14}.$ Finally, in $\triangle CBD,$ we have BD=$6\cos\theta \implies \boxed{\textbf{(D) }\frac{39}{7}}.$

*~SirAppel*
## Solution 4 (Law of Cosines+Law of Sines+Trig Identities)
Let $\angle BCA =$ x, $\angle DCA =$ y. If we know $\cos(x+y)$ we can compute BD. Notice that $\cos(x+y)=\cos(x)\cos(y)-\sin(x)\sin(y).$ Now it remains to find all 4 terms in this equation. Applying Law of Cosines on triangle ABC to find $\cos(x),$ we find that $\cos(x)=-\frac{6}{42}=-\frac{1}{7}.$ Similarly we find that $\cos(y)=\frac{11}{14}.$ Now we compute $\sin(x)$ and $\sin(y).$ Applying Law of Sines on triangle ABC we see that $\frac{\sin(x)}{8}=\frac{\sin(\frac{\pi}{3})}{7},$ or $\sin(x)=\frac{4\sqrt{3}}{7}.$ Similarly $\sin(y)=\frac{5\sqrt{3}}{14}.$ Now $\cos(x+y)=-\frac{71}{98}.$ Let BD=k, we see that $k^2=3^2+3^2+2*3*3($\frac{71}{98})$.$ Solving for k yields $k=\frac{39}{7}.$

*~CreamyCream*
## Video Solution, Fast, Quick, Easy!
https://youtu.be/g4xdfcFgwGo

https://youtu.be/RQucKqjdNv8

*~MC*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=f32mBtYTZp8
