# 2016 AMC 12A Problem 21

> This problem is the same as [2016 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2016_AMC_10A_Problems#Problem_24) and [2016 AMC 12A #21](https://artofproblemsolving.com/wiki/index.php/2016_AMC_12A_Problems#Problem_21).
## Problem
A quadrilateral is inscribed in a circle of radius $\sqrt{2}$. Three of the sides of this quadrilateral have length $200$. What is the length of the fourth side?

$\textbf{(A) }200\qquad \textbf{(B) }200\sqrt{2}\qquad\textbf{(C) }200\sqrt{3}\qquad\textbf{(D) }300\sqrt{2}\qquad\textbf{(E) } 500$
## Solution 1
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, E, F, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,ENE);
label("$O$",O,S);
label("$\theta$",O,3N);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


//Construction
E=extension(B,O,A,D);


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$E$",E,NE);
```


F=extension(C,O,A,D);


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$F$",F,NE);
```


//Angle marks

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(anglemark(C,O,B));
```


</asy>

Let $AD$ intersect $OB$ at $E$ and $OC$ at $F.$


$\overarc{AB}= \overarc{BC}= \overarc{CD}=\theta$

$\angle{BAD}=\frac{1}{2} \cdot \overarc{BCD}=\theta=\angle{AOB}$


From there, $\triangle{OAB} \sim \triangle{ABE}$, thus:

$\frac{OA}{AB} = \frac{AB}{BE} = \frac{OB}{AE}$

$OA = OB$ because they are both radii of $\odot{O}$. Since $\frac{OA}{AB} = \frac{OB}{AE}$, we have that $200 = AB = AE$. Similarly, $CD = DF$.

$OE = 100\sqrt{2} = \frac{OB}{2}$ and $EF=\frac{BC}{2}=100$ , so $AD=AE + EF + FD = 200 + 100 + 200 = \boxed{\textbf{(E) } 500}$
### Note
The first angle chase is done by the central angle theorem. Note that $\angle BAD$ is an inscribed angle from $BD$ to $A$, which is always $\frac{1}{2}$ of the angle of $\overarc{BD}$. Hence follows.

Furthermore, we get $OE=100\sqrt{2}$ from the similar triangles mentioned. We have: $\frac{200}{200\sqrt{2}}=\frac{BE}{200}$. Hence, $BE=100\sqrt{2}$ and so $OE=OB-BE=100\sqrt{2}$.
*~mathboy282*
## Solution 2 (Algebra)
To save us from getting big numbers with lots of zeros behind them, let's divide all side lengths by $200$ for now, then multiply it back at the end of our solution.


<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, E, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
E=extension(B,D,O,C);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,E);
label("$E$",E,WSW);
label("$O$",O,S);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


//Construction

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(B--D);
draw(rightanglemark(C,E,D));
```

</asy>

Construct quadrilateral $ABCD$ on the circle with $AD$ being the missing side (Notice that since the side length is less than the radius, it will be very small on the top of the circle). Now, draw the radii from center $O$ to $A,B,C,$ and $D$. Let the intersection of $BD$ and $OC$ be point $E$. Notice that $BD$ and $OC$ are perpendicular because $BCDO$ is a kite.

We set lengths $BE=ED$ equal to $x$ (Solution 1.1 begins from here). By the Pythagorean Theorem,


$$\sqrt{1^2-x^2}+\sqrt{(\sqrt{2})^2-x^2}=\sqrt{2}$$


We solve for $x$:


$$1-x^2+2-x^2+2\sqrt{(1-x^2)(2-x^2)}=2$$


$$2\sqrt{(1-x^2)(2-x^2)}=2x^2-1$$


$$4(1-x^2)(2-x^2)=(2x^2-1)^2$$


$$8-12x^2+4x^4=4x^4-4x^2+1$$


$$8x^2=7$$


$$x=\frac{\sqrt{14}}{4}$$


By [Ptolemy's Theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_Theorem),


$$AB \cdot CD + BC \cdot AD = AC \cdot BD = BD^2 = (2 \cdot BE)^2$$


Substituting values,


$$1^2+1 \cdot AD = 4{\left( \frac{\sqrt{14}}{4} \right)}^2$$


$$1+AD=\frac{7}{2}$$


$$AD=\frac{5}{2}$$


Finally, we multiply back the $200$ that we divided by at the beginning of the problem to get $AD=\boxed{\textbf{(E) } 500}$.
## Solution 3 (Extended Law of Sines and Light Trig)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
P=RADIUS*dir(270);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,E);
label("$O$",O,S);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
draw(P--A);
draw(P--B);
draw(P--C);
draw(P--D);
```


Draw some point $P$ somewhere on major arc $\overarc{AD}$. Let $\angle AOB \cong \angle BOC \cong \angle COD = 2\theta$. Then, by inscribed angle $\angle APB \cong \angle BPC \cong \angle CPD = \theta$. By extended law of sines, we have $\frac{200}{\text{sin}(\theta)} = 2(200\sqrt{2}) \implies \text{sin}(\theta) = \frac{\sqrt{2}}{4}$. Using the triple angle sine formula, we have $\text{sin}(3\theta)=3\text{sin}(\theta) - 4\text{sin}^3(\theta) = \frac{5\sqrt{2}}{8}$.
Then, again by extended law of sines, we have $\frac{AD}{\text{sin}(3\theta)}=400\sqrt{2}$. Thus, $AD = \text{sin}(3\theta) 400\sqrt{2} = \boxed{500}$.
## Solution 3 (HARD Algebra)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,E);
label("$O$",O,S);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


</asy>

Let quadrilateral $ABCD$ be inscribed in circle $O$, where $AD$ is the side of unknown length. Draw the radii from center $O$ to all four vertices of the quadrilateral, and draw the altitude of $\triangle BOC$ such that it passes through side $AD$ at the point $G$ and meets side $BC$ at point $H$.

By the Pythagorean Theorem, the length of $OH$ is


$$\begin{align*}

$$
\sqrt{CO^2 - HC^2} &= \sqrt{(200\sqrt{2})^2 - \left(\frac{200}{2}\right)^2}
\\ &= \sqrt{80000 - 10000}
\\ &= \sqrt{70000}
\\ &= 100\sqrt{7}.
$$

$\end{align*}$$$


Note that $[ABCDO] = [AOB] + [BOC] + [COD] = [AOD] + [ABCD].$ Let the length of $OG$ be $h$ and the length of $AD$ be $x$; then we have that

$[AOB] + [BOC] + [COD] = \frac{200 \times 100\sqrt{7}}{2} + \frac{200 \times 100\sqrt{7}}{2} + \frac{200 \times 100\sqrt{7}}{2} = \frac{x \times h}{2} + \frac{(100\sqrt{7} - h)(200 + x)}{2} = [AOD] + [ABCD].$

Furthermore,


$$\begin{align*}

$$
h &= \sqrt{OD^2 - GD^2}
\\ &= \sqrt{(200\sqrt{2})^2 - \left(\frac{x}{2}\right)^2}
\\ &= \sqrt{80000 - \frac{x^2}{4}}
$$

$\end{align*}$$$


Substituting this value of $h$ into the previous equation and evaluating for $x$, we get:


$$\frac{200 \times 100\sqrt{7}}{2} + \frac{200 \times 100\sqrt{7}}{2} + \frac{200 \times 100\sqrt{7}}{2} = \frac{x \times h}{2} + \frac{(100\sqrt{7} - h)(200 + x)}{2}$$


$$\frac{3 \times 200 \times 100\sqrt{7}}{2} = \frac{x\sqrt{80000 - \frac{x^2}{4}}}{2} + \frac{\left(100\sqrt{7} - \sqrt{80000 - \frac{x^2}{4}}\right)(200 + x)}{2}$$


$$60000\sqrt{7} = \left(x\sqrt{80000 - \frac{x^2}{4}}\right) + \left(20000\sqrt{7}\right) + \left(100x\sqrt{7}\right) - \left(200\sqrt{80000 - \frac{x^2}{4}}\right) - \left(x\sqrt{80000 - \frac{x^2}{4}}\right)$$


$$40000\sqrt{7} = 100x\sqrt{7} - 200\sqrt{80000 - \frac{x^2}{4}}$$


$$400\sqrt{7} = x\sqrt{7} - 2\sqrt{80000 - \frac{x^2}{4}}$$


$$(x - 400)\sqrt{7} = 2\sqrt{80000 - \frac{x^2}{4}}$$


$$7(x-400)^2 = 4\left(80000 - \frac{x^2}{4}\right)$$


$$7x^2 - 5600x + 1120000 = 320000 - x^2$$


$$8x^2 - 5600x + 800000 = 0$$


$$x^2 - 700x + 100000 = 0$$


The roots of this quadratic are found by using the quadratic formula:


$$\begin{align*}

$$
x &= \frac{-(-700) \pm \sqrt{(-700)^2 - 4 \times 1 \times 100000}}{2 \times 1}
\\ &= \frac{700 \pm \sqrt{490000 - 400000}}{2}
\\ &= \frac{700}{2} \pm \frac{\sqrt{90000}}{2}
\\ &= 350 \pm \frac{300}{2}
$$

\\ &= 200, 500
$\end{align*}$$$


If the length of $AD$ is $200$, then $ABCD$ would be a square. Thus, the radius of the circle would be


$$\frac{\sqrt{200^2 + 200^2}}{2} = \frac{\sqrt{80000}}{2} = \frac{200\sqrt{2}}{2} = 100\sqrt{2}$$


Which is a contradiction. Therefore, our answer is $\boxed{500}.$
## Solution 4 (Trigonometry Bash)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,E);
label("$O$",O,S);
label("$\theta$",O,3N);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


//Angle mark for BOC

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(anglemark(C,O,B));
```

</asy>

Construct quadrilateral $ABCD$ on the circle with $AD$ being the missing side (Notice that since the side length is less than the radius, it will be very small on the top of the circle). Now, draw the radii from center $O$ to $A,B,C,$ and $D$. Apply the [law of cosines](https://artofproblemsolving.com/wiki/index.php/law_of_cosines) on $\Delta BOC$; let $\theta = \angle BOC$. We get the following equation:

$$(BC)^{2}=(OB)^{2}+(OC)^{2}-2\cdot OB \cdot OC\cdot \cos\theta$$

 Substituting the values in, we get

$$(200)^{2}=2\cdot (200)^{2}+ 2\cdot (200)^{2}- 2\cdot 2\cdot (200)^{2}\cdot \cos\theta$$

 Canceling out, we get

$$\cos\theta=\frac{3}{4}$$


Because $\angle AOB$, $\angle BOC$, and $\angle COD$ are congruent, $\angle AOD = 3\theta$. To find the remaining side $(AD)$, we simply have to apply the law of cosines to $\Delta AOD$. Now, to find $\cos 3\theta$, we can derive a formula that only uses $\cos\theta$:

$$\cos 3\theta=\cos (2\theta+\theta)= \cos 2\theta \cos\theta- (2\sin\theta \cos\theta) \cdot \sin \theta$$



$$\cos 3\theta= \cos\theta (\cos 2\theta-2\sin^{2}\theta)=\cos\theta (2\cos^{2}\theta-3+2\cos^{2}\theta)$$



$$\Rightarrow \cos 3\theta=4\cos^{3}\theta-3\cos\theta$$

 It is useful to memorize the triple angle formulas $(\cos 3\theta=4\cos^{3}\theta-3\cos\theta, \sin 3\theta=3\sin\theta-4\sin^{3}\theta)$.  Plugging in $\cos\theta=\frac{3}{4}$, we get $\cos 3\theta= -\frac{9}{16}$. Now, applying law of cosines on triangle $OAD$, we get

$$(AD)^{2}= 2\cdot (200)^{2}+ 2\cdot (200)^{2}+2\cdot 200\sqrt2 \cdot 200\sqrt2 \cdot \frac{9}{16}$$



$$\Rightarrow 2\cdot (200)^{2} \cdot (1+1+ \frac{9}{8})=(200)^{2}\cdot \frac{25}{4}$$



$$AD=200 \cdot \frac{5}{2}=\boxed{500}$$
## Solution 5 (Easier Trigonometry)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, E, F, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
E=foot(A,B,C);
F=foot(D,B,C);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,ENE);
label("$O$",O,S);
label("$\theta$",O,3N);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


//Construction

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--E);
draw(E--B);
draw(C--F);
draw(F--D);
label("$E$",E,NW);
label("$F$",F,NE);
```


//Angle marks

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(anglemark(C,O,B));
draw(rightanglemark(A,E,B));
draw(rightanglemark(C,F,D));
```

</asy>

Construct quadrilateral $ABCD$ on the circle $O$ with $AD$ being the desired side. Then, drop perpendiculars from $A$ and $D$ to the extended line of $\overline{BC}$ and let these points be $E$ and $F$, respectively. Also, let $\theta = \angle BOC$. From the [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines) on $\triangle BOC$, we have $\cos \theta = \frac{3}{4}$.

Now, since $\triangle BOC$ is isosceles with $\overline{OB} \cong \overline{OC}$, we have that $\angle BCO = \angle CBO = 90 - \frac{\theta}{2}$. In addition, we know that $\overline{BC} \cong \overline{CD}$ as they are both equal to $200$ and $\overline{OB} \cong \overline{OC} \cong \overline{OD}$ as they are both radii of the same circle. By SSS Congruence, we have that $\triangle OBC \cong \triangle OCD$, so we have that $\angle OCD = \angle BCO = 90 - \frac{\theta}{2}$, so $\angle DCF = \theta$.

Thus, we have $\frac{FC}{DC} = \cos \theta = \frac{3}{4}$, so $FC = 150$. Similarly, BE $= 150$, and $AD = 150 + 200 + 150 = \boxed{500}$.
## Solution 6 (Ptolemy's Theorem)
<asy>
pathpen = black; pointpen = black;

> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
draw(unitcircle);
pair A = D("A", dir(50), dir(50));
pair B = D("B", dir(90), dir(90));
pair C = D("C", dir(130), dir(130));
pair D = D("D", dir(170), dir(170));
pair O = D("O", (0,0), dir(-90));
draw(A--C, red);
draw(B--D, blue+dashed);
draw(A--B--C--D--cycle);
draw(A--O--C);
draw(O--B);
```

</asy>

Let $s = 200.  Let O$ be the center of the circle.  Then $AC$ is twice the altitude of $\triangle OBC$ to $\overline{OB}$.  Since $\triangle OBC$ is isosceles we can compute its area to be $\frac{s^2 \sqrt{7}}{4}$, hence $CA = 2 \cdot \tfrac{2 \cdot s^2\sqrt7/4}{s\sqrt2} = \sqrt{\frac{7}{2}}$.

Now by Ptolemy's Theorem we have $CA^2 = s^2 + AD \cdot s \implies AD = \left(\frac{7}{2}-1\right)s.$ This gives us:

$$\boxed{\textbf{(E) } 500.}$$
## Solution 7 (Trigonometry)
Since all three sides equal $200$, they subtend three equal angles from the center. The right triangle between the center of the circle, a vertex, and the midpoint between two vertices has side lengths $100,\sqrt{7},200\sqrt{2}$ by the Pythagorean Theorem. Thus, the sine of half of the subtended angle is $\frac{100}{200\sqrt{2}}=\frac{\sqrt{2}}{4}$. Similarly, the cosine is $\frac{100\sqrt{7}}{200\sqrt{2}}=\frac{\sqrt{14}}{4}$.
Since there are three sides, and since $\sin\theta=\sin\left(180-\theta\right)$,we seek to find $2r\sin 3\theta$.
First, $\sin 2\theta=2\sin\theta\cos\theta=2\cdot\left(\frac{\sqrt{2}}{4}\right)\left(\frac{\sqrt{14}}{4}\right)=\frac{2\sqrt{2}\sqrt{14}}{16}=\frac{\sqrt{7}}{4}$ and $\cos 2\theta=\frac{3}{4}$ by Pythagorean.


$$\sin 3\theta=\sin(2\theta+\theta)=\sin 2\theta\cos\theta+\sin \theta\cos 2\theta=\frac{\sqrt{7}}{4}\left(\frac{\sqrt{14}}{4}\right)+\frac{\sqrt{2}}{4}\left(\frac{3}{4}\right)=\frac{7\sqrt{2}+3\sqrt{2}}{16}=\frac{5\sqrt{2}}{8}$$


$$2r\sin 3\theta=2\left(200\sqrt{2}\right)\left(\frac{5\sqrt{2}}{8}\right)=400\sqrt{2}\left(\frac{5\sqrt{2}}{8}\right)=\frac{800\cdot 5}{8}=\boxed{\textbf{(E)}\text{ 500}}$$
## Solution 8 (Area By Brahmagupta's Formula)
For simplicity, scale everything down by a factor of 100. Let the inscribed trapezoid be $ABCD$, where $AB=BC=CD=2$ and $DA$ is the missing side length. Let $DA=2x. If M$ and $N$ are the midpoints of $BC$ and $AD$, respectively, the height of the trapezoid is $OM-ON$. By the pythagorean theorem, $OM=\sqrt{OB^2-BM^2}=\sqrt7$ and $ON=\sqrt{OA^2-AN^2}=\sqrt{8-x^2}$. Thus the height of the trapezoid is $\sqrt7-\sqrt{8-x^2}$, so the area is $\frac{(2+2x)(\sqrt7-\sqrt{8-x^2})}{2}=(x+1)(\sqrt7-\sqrt{8-x^2})$. By [Brahmagupta's formula](https://artofproblemsolving.com/wiki/index.php/Brahmagupta's_formula), the area is $\sqrt{(x+1)(x+1)(x+1)(3-x)}$. Setting these two equal, we get $(x+1)(\sqrt7-\sqrt{8-x^2})=\sqrt{(x+1)(x+1)(x+1)(3-x)}$. Dividing both sides by $x+1$ and then squaring, we get $7-2(\sqrt7)(\sqrt{8-x^2})+8-x^2=(x+1)(3-x)$. Expanding the right hand side and canceling the $x^2$ terms gives us $15-2(\sqrt7)(\sqrt{8-x^2})=2x+3$. Rearranging and dividing by two, we get $(\sqrt7)(\sqrt{8-x^2})=6-x$. Squaring both sides, we get $56-7x^2=x^2-12x+36$. Rearranging, we get $8x^2-12x-20=0$. Dividing by 4 we get $2x^2-3x-5=0$. Factoring we get, $(2x-5)(x+1)=0$, and since $x$ cannot be negative, we get $x=2.5$. Since $DA=2x, DA=5$. Scaling up by 100, we get $\boxed{\textbf{(E)}\text{ 500}}$.
## Solution 9 (Similar Triangles)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations, L is used to write alpha= statement

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, E, F, O, L;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
E=extension(A,D,O,B);
F=extension(A,D,O,C);
L=midpoint(C--D);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad = A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,NW);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,NE);
label("$E$",E,SW);
label("$F$",F,SE);
label("$O$",O,SE);
```

dot(O,linewidth(5));

//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


//Construction

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$\alpha = 90-\frac{\theta}{2}$",L,5NE,rgb(128, 0, 0));
draw(anglemark(C,O,B));
label("$\theta$",O,3N);
draw(anglemark(E,F,O));
label("$\alpha$",F,3SW);
draw(anglemark(D,F,C));
label("$\alpha$",F,3NE);
draw(anglemark(F,C,D));
label("$\alpha$",C,3SSE);
draw(anglemark(C,D,F));
label("$\theta$",(RADIUS-0.04)*dir(31.586),3WNW);
```

</asy>
Label the points as shown, and let $\angle{EOF} = \theta$. Since $\overline{OB} = \overline{OC}$, and $\triangle{OFE} \sim \triangle{OCB}$, we get that $\angle{EFO} = 90-\frac{\theta}{2}$. We assign $\alpha$ to $\frac{\theta}{2}$ for simplicity.
From here, by vertical angles $\angle{CFD} = \alpha$. Also, since $\triangle{OCB} \cong \triangle{ODC}$, $\angle{OCD} = \alpha$. This means that $\angle{CDF} = 180-2\alpha = \theta$, which leads to $\triangle{OCB} \sim \triangle{DCF}$.
Since we know that $\overline{CD} = 200, \overline{DF} = 200$, and by similar reasoning $\overline{AE} = 200$.
Finally, again using similar triangles, we get that $\overline{CF} = 100\sqrt{2}$, which means that $\overline{OF} = \overline{OC} - \overline{CF} = 200\sqrt{2} - 100\sqrt{2} = 100\sqrt{2}$. We can again apply similar triangles (or use Power of a Point) to get $\overline{EF} = 100$, and finally $\overline{AD} = \overline{AE}+\overline{EF}+\overline{FD} = 200+100+200=\boxed{\textbf{(E)}500}$ - ColtsFan10
## Solution 10 (Complex Numbers)
We first scale down by a factor of $\sqrt{2}$. Let the vertices of the quadrilateral be $A$, $B$, $C$, and $D$, so that $AD$ is the length of the fourth side. We draw this in the complex plane so that $D$ corresponds to the complex number $1$, and we let $C$ correspond to the complex number $z$. Then, $A$ corresponds to $z^3$ and $B$ corresponds to $z^2$. We are given that $\lvert z \rvert = 1$ and $\lvert z-1 \rvert = \sqrt{2}$, and we wish to find $\lvert z^3 - 1 \rvert=\lvert z^2+z+1\rvert \cdot \lvert z-1 \rvert=\lvert (z^2+z+1)/\sqrt{2} \rvert$. Let $z=a+bi$, where $a$ and $b$ are real numbers. Then, $a^2+b^2=1$ and $a^2-2a+1+b^2=1/2$; solving for $a$ and $b$ yields $a=3/4$ and $b=\sqrt{7}/4$. Thus, $AD = \lvert z^3 - 1 \rvert = \lvert (z^2+z+1)/\sqrt{2} \rvert = \lvert (15/8 + \sqrt{7}/8 \cdot i)/\sqrt{2} \rvert = \frac{5\sqrt{2}}{4}$. Scaling back up gives us a final answer of $\frac{5\sqrt{2}}{4} \cdot 200\sqrt{2} = \boxed{\textbf{(E)} 500}$.

*~Leo.Euler*
## Solution 11 (Trignometry + Ptolemy’s)
Let angle $C$ be $2a$. This way $BD$ will be $400sin(a)$. Now we can trig bash. As the circumradius of triangle $BCD$ is $\sqrt{2}$, we can use the formula

$$R=\frac{abc}{4A}$$

 and

$$A=\frac{absin(C)}{2}$$

 and plug in all the values we got to get

$$200\sqrt{2}=\frac{200^2 \cdot 400sin(a)}{4 \cdot (\frac{200^2 sin(2a)}{2})}$$

. This boils down to

$$\sqrt{2}=\frac{sin(a)}{sin{2a}}$$

. This expression can further be simplified by the trig identity

$$sin(2a)=2sin(a)cos(a)$$

. This leads to the final simplified form

$$2\sqrt{2}=\frac{1}{cos(a)}$$

. Solving this expression gives us

$$cos(a)=\frac{\sqrt{2}}{4}$$

. However, as we want $sin(a)$, we use the identity $sin^2+cos^2=1$, and substitute  to get that $sin(a)=\frac{\sqrt{14}}{4}$, and therefore BD is $\sqrt{14}$.

Then, as $ABCD$ is a cyclic quadrilateral, we can use [Ptolemy’s Theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy’s_Theorem) (with $AD=x$) to get

$$14 \cdot 100^2=200x+200^2$$

. Finally, we solve to get $\boxed{\textbf{(E) } 500}$.

*~dragoon*
## Solution 12 (Simple Trigonometry with Geometric Observations)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,E);
label("$O$",O,S);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


</asy>
Claim: $[ABCD]$ is an isosceles trapezoid.

Proof: Notice that $[ABCD]$ is cyclic, triangle $BOC$ is isosceles, and triangle $AOB$ is congruent to $DOC$ by SSS congruence. Therefore, $\angle BAD = 180 - \angle BCD = 180-(\angle BCO + \angle DCO)=180-(\angle CBO+\angle ABO) = 180 - \angle ABC = \angle CDA$. Hence, $[ABCD]$ is an isosceles trapezoid.

Let $\angle CDA=\alpha$. Notice that the length of the altitude from $C$ to $AD$ is $200sin(\alpha)$. Furthermore, the length of the altitude from $O$ to $BC$ is $\sqrt{7}$ by the Pythagorean theorem. Therefore, the length of the altitude from $O$ to $AD$ is $\sqrt{7}-200sin\alpha$. Let $F$ the feet of the altitude from $O$ to $AD$. Then, $FD=(200+400cos(\alpha))/2=100+200cos(\alpha)$, because $AOD$ is isosceles.

Therefore, by the Pythagorean theorem, $(100+200cos(\alpha))^2+(100\sqrt{7}-200sin(\alpha))^2=80000$. Simplifying, we have $1+cos(\alpha)=sin(\alpha) \cdot sqrt{7} \implies cos^2(\alpha)+2cos(\alpha)+1=sin^2(\alpha) \cdot 7 = 7-7cos^2(\alpha) \implies 8cos^2(\alpha)+2cos(\alpha) - 6 =0$. Solving this quadratic, we have $cos(\alpha)=\frac{3}{4}, -1$, but $0<\alpha<180 \implies cos(\alpha)=3/4$. Therefore, $AD=200cos(\alpha)+200cos(\alpha)+200=\boxed{500}$

- [mathMagicOPS]
## Solution 13 (Law of Cosines)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250);
defaultpen(linewidth(0.4));
```

//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
real RADIUS;
pair A, B, C, D, E, F, O;
RADIUS=3;
```


//Variable Definitions
A=RADIUS*dir(148.414);
B=RADIUS*dir(109.471);
C=RADIUS*dir(70.529);
D=RADIUS*dir(31.586);
O=(0,0);

//Path Definitions

> [Asymptote diagram - not rendered in Markdown]

```asy
path quad= A -- B -- C -- D -- cycle;
```


//Initial Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O, RADIUS), linewidth(0.8));
draw(quad, linewidth(0.8));
label("$A$",A,W);
label("$B$",B,NW);
label("$C$",C,NE);
label("$D$",D,ENE);
label("$O$",O,S);
label("$\theta$",O,3N);
```


//Radii

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(O--A);
draw(O--B);
draw(O--C);
draw(O--D);
```


//Construction
E=extension(B,O,A,D);


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$E$",E,NE);
```


F=extension(C,O,A,D);


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$F$",F,NE);
```


//Angle marks

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(anglemark(C,O,B));
```


</asy>

Since $AB$, $BC$, and $CD$ are congruent chords, the triangles formed by connecting these sides to the circumcenter $O$ (i.e., $\triangle AOB$, $\triangle BOC$, $\triangle COD$) are congruent isosceles triangles.
Let $\alpha = \angle OCB$. In $\triangle BOC$, the side length $BC=200$ and $OC = OB = \sqrt{2}$. By dropping an altitude from $O$ to $BC$, we bisect $BC$. Half the base is $\frac{200}{2} = 100$.
Using the right triangle formed, we find $\cos(\alpha)$:


$$\cos(\alpha) = \frac{\text{Adjacent}}{\text{Hypotenuse}} = \frac{100}{200\sqrt{2}} = \frac{\sqrt{2}}{4}$$


Since $\triangle BOC \cong \triangle COD$, we have $m\angle OCB = \angle OCD = \alpha$.
The interior angle measure $m\angle DCB$ is given by:


$$m\angle DCB = m\angle OCB + m\angle OCD = 2\alpha$$


We calculate $\cos(2\alpha)$ using the double-angle identity:


$$\cos(2\alpha) = 2\cos^2(\alpha) - 1$$


$$\cos(2\alpha) = 2\left(\frac{\sqrt{2}}{4}\right)^2 - 1 = \frac{1}{4} - 1 = -\frac{3}{4}$$


Now, apply the Law of Cosines to $\triangle BCD$ to find $BD^2$:


$$BD^2 = BC^2 + CD^2 - 2(BC)(CD)\cos(\angle DCB)$$


$$BD^2 = 200^2 + 200^2 - 2(200)(200)\left(-\frac{3}{4}\right)$$


$$BD^2 = 80000 + 60000 = 140000$$


Since $ABCD$ is a cyclic quadrilateral, the opposite angles are supplementary:


$$m\angle DAB = 180^\circ - m\angle DCB = 180^\circ - 2\alpha$$


Thus, we find $\cos(\angle DAB)$:


$$\cos(\angle DAB) = \cos(180^\circ - 2\alpha) = -\cos(2\alpha)$$


$$\cos(\angle DAB) = -\left(-\frac{3}{4}\right) = \frac{3}{4}$$


Finally, we apply the Law of Cosines to $\triangle DAB$ to find the side length $AD$. Let $AD = a$:


$$140000 = 200^2 + a^2 - 2(200)(a)\left(\frac{3}{4}\right)$$


$$140000 = 40000 + a^2 - 300a$$


Rearranging the terms yields the quadratic equation:


$$a^2 - 300a - 100000 = 0$$


We solve this equation by factoring:


$$(a - 500)(a + 200) = 0$$


The two possible solutions for $a$ are $a=500$ and $a=-200$. Since $a$ represents a side length, it must be positive, so $a = 500$, which means $AD = 500$, or $\boxed{\textbf{(E) } 500}$.

*~Voidling*
## Solution 14 (Kites)
Let our quadrilateral be ABCD, inscribed in circle O, with unknown side AD

$\newline$ Notice that by the problem statement, AB = CD This implies that $AB\parallel CD$, as AB = CD $\iff$
$AB\parallel CD$ in a circle.
$\newline$ obviously $m\angle{AOB}=m\angle{BOC} = m\angle{COD}$
$\newline$ By SAS congruency $\triangle{AOB}=\triangle{BOC} = \triangle{COD}$
$\newline$ Draw $\overline{AO}$,$\overline{BO}$,$\overline{CO}$,$\overline{DO}$.
$\newline$ let $\overline{BO}$,$\overline{CO}\cap\overline{AD}$ at P and Q respectively.
$\newline$ By interior angle theorem, $m\angle{BPA} = m\angle{OBC}$ (For the sake of simplicity, we will only prove this on one side, since all triangles are congruent as above, the same applies for the right side)
$\newline$ Notice that ABCO is a kite as $AB = BC = 200$ and $OA=OC = 200\sqrt{2}$. Thus, $OB$ bisects $\angle{ABC}$. This implies that $\triangle{ABP}$~$\triangle{OAB}$
$\newline$ From this we obtain $\frac{200}{200\sqrt{2}}=\frac{BP}{200}$, from which we obtain $BP = 100\sqrt{2}$ and by isosceles triangle theorem, $BP = 200$
$\newline$ Additionally, we obtain $m\angle{BPA}=m\angle{OPQ}$ by vertical angles, from which we obtain $\triangle{OPQ}$~$\triangle{OBC}$, which implies $\frac{200\sqrt{2}-100\sqrt{2}}{200\sqrt{2}}=\frac{PQ}{200}\rightarrowPQ = 100.$
$\newline$ The requested length, $AD =2*BP+PQ =$$\boxed{\textbf{(E) } 500}$.
*~Stereotypicalmathnerd*
## Remark (Morley's Trisector Theorem)
This problem is related to [http://www.cut-the-knot.org/triangle/Morley/Naraniengar.shtml M. T. Naraniengar's proof] of [https://en.wikipedia.org/wiki/Morley%27s_trisector_theorem Morley's Trisector Theorem]. This problem is taken from the figure of the Lemma of M. T. Naraniengar's proof, as shown below.

[200px](https://artofproblemsolving.com/wiki/index.php/File:NaraniengarLemma.gif)

If four points $Y'$, $Z$, $Y$, $Z'$ satisfy the conditions

$\quad1.Y'Z = ZY = YZ'$ and

$\quad2.\angle YZY'$ = $\angle Z'YZ$ = $180^{\circ} - 2a > 60^{\circ}$

then they lie on a circle.


The Lemma is used to prove Morley's Trisector Theorem by constructing an equilateral triangle at $YZ$ and extending $AY'$ and $AZ'$ as shown below.

[400px](https://artofproblemsolving.com/wiki/index.php/File:NaraniengarTheorem.gif)

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solution by AoPS (Deven Ware)
https://www.youtube.com/watch?v=hpSyHZwsteM
## Video Solution by Walt S.
https://www.youtube.com/watch?v=3iDqR9YNNkU
## Video Solution (Ptolemy’s Theorem)
https://youtu.be/NsQbhYfGh1Q?t=5094

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/OF0ZI4IV7v0?si=a3GLZcK4hLlrGJVt

*~IceMatrix*
## Video Solution by Punxsutawney Phil
https://www.youtube.com/watch?v=st6HIgDWgX4
## Video Solution by OmegaLearn
https://youtu.be/NsQbhYfGh1Q?t=5094

*~pi_is_3.14*
## See Also
