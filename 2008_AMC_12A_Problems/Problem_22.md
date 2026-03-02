# 2008 AMC 12A Problem 22

> This problem is the same as [2008 AMC 12A #22](https://artofproblemsolving.com/wiki/index.php/2008_AMC_12A_Problems) and [2008 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2008_AMC_10A_Problems/Problem_25).
## Problem
A round table has radius 4. Six rectangular place mats are placed on the table. Each place mat has width 1 and length x as shown. They are positioned so that each mat has two corners on the edge of the table, these two corners being end points of the same side of length x. Further, the mats are positioned so that the inner corners each touch an inner corner of an adjacent mat. What is x?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(4mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=(-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle; draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); label("$x$",(-1.55,2.1),E); label("$1$",(-0.5,3.8),S);
```


$$\mathrm{(A)}\ 2\sqrt{5}-\sqrt{3}\qquad\mathrm{(B)}\ 3\qquad\mathrm{(C)}\ \frac{3\sqrt{7}-\sqrt{3}}{2}\qquad\mathrm{(D)}\ 2\sqrt{3}\qquad\mathrm{(E)}\ \frac{5+2\sqrt{3}}{2}$$

## Solution 1 (Trigonometry)
Let one of the mats be ABCD, and the center be O as shown:


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=(-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle; draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); label("$x$",(-1.55,2.1),E); label("$x$",(0.03,1.5),E); label("$A$",(-3.6,2.5513),E); label("$B$",(-3.15,1.35),E); label("$C$",(0.05,3.20),E); label("$D$",(-0.75,4.15),E); label("$O$",(0.00,-0.10),E); label("$1$",(-0.1,3.8),S); label("$4$",(-0.4,2.2),S); draw((0,0)--(0,3.103)); draw((0,0)--(-2.687,1.5513)); draw((0,0)--(-0.5,3.9686));
```


Since there are 6 mats, $\Delta BOC$ is [equilateral](https://artofproblemsolving.com/wiki/index.php/equilateral) (the hexagon with side length x is regular). So, BC=CO=x. Also, $\angle OCD = \angle OCB + \angle BCD = 60^\circ+90^\circ=150^\circ.$

By the [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines): $4^2=1^2+x^2-2\cdot1\cdot$ x $\cdot \cos(150^\circ) \Rightarrowx^2 +x\sqrt{3} - 15 = 0 \Rightarrowx =\frac{-\sqrt{3}\pm 3\sqrt{7}}{2}.$

Since x must be positive, x = $\frac{3\sqrt{7}-\sqrt{3}}{2} \Rightarrow (C).$
## Solution 2 (without trigonometry)
Draw OD and OC as in the diagram. Draw the altitude from O to DC and call the intersection E.


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=((-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle); draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); pair D = rotate(300)*(-3.687,1.5513); pair C = rotate(300)*(-2.687,1.5513); pair EE = foot((0.00,0.00),D,C); draw(D--EE--(0,0)); label("$x$",(-1.55,2.1),E); label("$x$",(0.03,1.5),E); label("$A$",(-3.6,2.5513),E); label("$B$",(-3.15,1.35),E); label("$C$",(0.05,3.20),E); label("$D$",(-0.75,4.15),E); label("$O$",(0.00,-0.10),E); label("$1$",(-0.1,3.8),S); label("$4$",(-0.4,2.2),S); draw((0,0)--(0,3.103)); draw((0,0)--(-2.687,1.5513)); draw((0,0)--(-0.5,3.9686)); label("$E$", EE,SE);
```


As proved in the first solution,  $\angle OCD = 150^\circ.$
That makes $\Delta OCE$ a 30-60-90 triangle, so OE = $\frac{x}{2}$ and CE= $\frac{x\sqrt 3}{2}$

Since  $\Delta ODE$ is a right triangle,

$$\left({\frac{x}{2}}\right)^2 + \left({\frac{x\sqrt 3}{2} +1}\right)^2 = 4^2 \Rightarrow x^2+x\sqrt3-15 = 0$$


Solving for x gives  x =$\frac{3\sqrt{7}-\sqrt{3}}{2}\Rightarrow (C)$
## Solution 3 (simply Pythagorean Theorem)
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=(-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle; draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); label("$x$",(-1.55,2.1),E); label("$x$",(0.03,1.5),E); label("$A$",(-3.6,2.5513),E); label("$B$",(-3.15,1.35),E); label("$C$",(0.05,3.20),E); label("$D$",(-0.75,4.15),E); label("$E$",(0,4.17)); label("$F$",(0.75,4.15),W); label("$O$",(0.00,-0.10),E); label("$1$",(-0.1,3.8),S); label("$4$",(-0.4,2.2),S); draw((0,0)--(0,3.103)); draw((0,0)--(-2.687,1.5513)); draw((0,0)--(-0.5,3.9686)); draw((0,0)--(-0.5,3.9686));
```


By symmetry, E is the midpoint of DF and OE is an extension of OC. Thus $\angle OED = 90^\circ.$ Since OD = 4 and DE = $\frac{1}{2}, OE = \sqrt{16-\frac{1}{4}} = \frac{\sqrt{63}}{2} = \frac{3\sqrt{7}}{2}.$ Since $\triangle CED$ is 30-60-90, CE = $\frac{\sqrt{3}}{2} (t$his can also be deduced from Pythagoras on $\triangle CED).$

Thus OC = $\frac{3\sqrt{7}-\sqrt{3}}{2}.$ As previous solutions noted, $\triangle BOC$ is equilateral, and thus the desired length is x = OC $\implies (C).$
## Solution 4
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=(-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle; draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); label("$x$",(-1.95,3),E); label("$A$",(-3.6,2.5513),E); label("$C$",(0.05,3.20),E); label("$E$",(0.40,-3.60),E); label("$B$",(-0.75,4.15),E); label("$D$",(-2.62,1.5),E); label("$F$",(-2.64,-1.43),E); label("$G$",(-0.2,-2.8),E); label("$\sqrt{3}x$",(-1.5,-0.5),E); label("$M$",(-2,-0.9),E); label("$O$",(0.00,-0.10),E); label("$1$",(-2.7,2.3),S); label("$1$",(0.1,-3.4),S); label("$8$",(-0.3,0),S); draw((0,-3.103)--(-2.687,1.5513)); draw((0.5,-3.9686)--(-0.5,3.9686));
```


Looking at the diagram above, we know that BE is a diameter of circle O due to symmetry. Due to [Thales' theorem](https://artofproblemsolving.com/wiki/index.php/Thales'_theorem), triangle ABE is a right triangle with $A = 90 ^\circ. AE$ lies on AD and GE because BAD is also a right angle. To find the length of DG, notice that if we draw a line from F to M, the midpoint of line DG, it creates two 30 - 60 - 90 triangles. Therefore, MD = MG = $\frac{\sqrt{3}x}{2} \Rightarrow DG = \sqrt{3}$x. AE = 2 + $\sqrt{3}$x

Applying the Pythagorean theorem to triangle ABE, we get ($2+\sqrt{3}x)^2 + x^2 = 8^2 \Rightarrow 4 + 3x^2 + 4\sqrt{3}x + x^2 = 64 \Rightarrowx^2 +\sqrt{3}$x - 15 = 0 Using the quadratic formula to solve, we get $x =\frac{-\sqrt{3} \pm \sqrt{3 -4(1)(-15)}}{2} = \frac{\pm 3\sqrt{7} - \sqrt{3}}{2}$ x must be positive, therefore $x =\frac{3\sqrt{7} - \sqrt{3}}{2} \Rightarrow (C)$

*~Zeric Hang*
## Solution 5 (coordinate bashing)
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=(-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle; draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); label("$x$",(-1.55,2.1),E); label("$1$",(-0.5,3.8),S);
```


We will let O(0,0) be the origin. This way the coordinates of C will be (0,y). By 30-60-90, the coordinates of D will be $\left(-\frac{1}{2},$ y + $\frac{\sqrt{3}}{2}\right).$ The distance any point with coordinates (x, y) is from the origin is $\sqrt{x^2 + y^2}.$ Therefore, the distance D is from the origin is 4 and $\frac{1}{4} +x^2 +x\sqrt{3} + \frac{3}{4} =x^2 +x\sqrt{3} + 1 = 16.$ We get the quadratic equation mentioned in solution 2. Using the quadratic formula, we get that x = $\frac{3\sqrt{7}-\sqrt{3}}{2} \Rightarrow (C)$

Note: Since C and D are not labeled in the diagram, refer to solution 1 for the location of points C and D.
## Solution 6
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8)+fontsize(8)); draw(Circle((0,0),4)); path mat=(-2.687,-1.5513)--(-2.687,1.5513)--(-3.687,1.5513)--(-3.687,-1.5513)--cycle; draw(mat); draw(rotate(60)*mat); draw(rotate(120)*mat); draw(rotate(180)*mat); draw(rotate(240)*mat); draw(rotate(300)*mat); label("$x$",(-1.55,2.1),E); label("$A$",(-3.6,2.5513),E); label("$B$",(-3.15,1.35),E); label("$C$",(0.05,3.20),E); label("$D$",(-0.75,4.15),E); label("$E$",(0.3,4.15),E); label("$F$",(-3.4,1.89),E); draw((0.5,3.9686)--(-3.13,2.45)); draw((0.5,3.9686)--(-2.95,2));
```


Notice that \overarc{AE} is $\frac16$ the circumference of the circle. Therefore, $\overline{AE}$ is the side length of an inscribed hexagon with side length 4. $\triangle AFE$ is a right triangle with $\overline{AF}=\frac12.$ The length of $\overline{EF}=x+\frac{\sqrt{3}}{2}.$ Using the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem), we get

$$4^2 = \left(\frac{1}{2}\right)^2 + \left(x+\frac{\sqrt{3}}{2}\right)^2$$

Solving for x, we get x = $\frac{3\sqrt{7}-\sqrt{3}}{2}$\ $\boxed{\text{C}}$
## Solution 7 (Answer Choices & Estimation)
The smallest distance between the intersection between two adjacent placemats and the circle is a bit less than 1. Thus, the answer will be a bit more than $4-1=3$. Going up, we guess that the next one up is the answer, $\frac{3\sqrt{7}-\sqrt{3}}{2},$ which is about 3.1. The next one up after that is $2\sqrt{3},$ which is about 3.5 and seems too big. So we circle $\boxed{\text{(C) }\frac{3\sqrt{7}-\sqrt{3}}{2}}$ and are happy we just cheesed the AMC 10 2008 problem 25.
## See Also
