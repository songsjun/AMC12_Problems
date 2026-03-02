# 2014 AMC 12B Problem 21

## Problem
In the figure,  ABCD  is a square of side length  1 . The rectangles  JKHG  and  EBCF  are congruent. What is  BE ?


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(1,0), B=(0,0), C=(0,1), D=(1,1), E=(2-sqrt(3),0), F=(2-sqrt(3),1), G=(1,sqrt(3)/2), H=(2.5-sqrt(3),1), J=(.5,0), K=(2-sqrt(3),1-sqrt(3)/2); draw(A--B--C--D--cycle); draw(K--H--G--J--cycle); draw(F--E); label("$A$",A,SE); label("$B$",B,SW); label("$C$",C,NW); label("$D$",D,NE); label("$E$",E,S); label("$F$",F,N); label("$G$",G,E); label("$H$",H,N); label("$J$",J,S); label("$K$",K,W);
```


$\textbf{(A) }\frac{1}{2}(\sqrt{6}-2)\qquad\textbf{(B) }\frac{1}{4}\qquad\textbf{(C) }2-\sqrt{3}\qquad\textbf{(D) }\frac{\sqrt{3}}{6}\qquad\textbf{(E) } 1-\frac{\sqrt{2}}{2}$
## Solution 1
Draw the altitude from H to AB and call the foot L. Then HL=1. Consider HJ. It is the hypotenuse of both right triangles $\triangle HGJ$ and $\triangle HLJ,$ and we know JG=HL=1, so we must have $\triangle HGJ$\cong$\triangle JLH$ by Hypotenuse-Leg congruence. From this congruence we have LJ=HG=BE.

Notice that all four triangles in this picture are similar. Also, we have LA=HD=EJ. So set x=LJ=HG=BE and y=LA=HD=EJ. Now BE+EJ+JL+LA=$2(x+y)=1$. This means $x+y=\frac{1}{2}=BE+EJ=BJ,$ so J is the midpoint of AB. So $\triangle AJG,$ along with all other similar triangles in the picture, is a 30-60-90 triangle, and we have AG=$\sqrt{3} \cdot AJ=\sqrt{3}/2$ and subsequently GD=$\frac{2-\sqrt{3}}{2}=KE.$ This means EJ=$\sqrt{3} \cdot KE=\frac{2\sqrt{3}-3}{2},$ which gives BE=$\frac{1}{2}-EJ=\frac{4-2\sqrt{3}}{2}=2-\sqrt{3},$ so the answer is $\textbf{(C)}.$
## Solution 2
Let BE = x.  Let JA = y.  Because $\angle FKH = \angle EJK = \angle AGJ = \angle DHG$ and $\angle FHK = \angle EKJ = \angle AJG = \angle DGH, \triangle KEJ, \triangle JAG, \triangle GDH, \triangle HFK$ are all similar.  Using proportions and the pythagorean theorem, we find

$$
EK = xy
FK = \sqrt{1-y^2}
EJ = x\sqrt{1-y^2}
$$

Because we know that BE+EJ+AJ = EK + FK = 1, we can set up a systems of equations and solving for x, we get

$$
x + x\sqrt{1-y^2} + y = 1 \implies x= \frac{1-y}{1+\sqrt{1-y^2}}
xy + \sqrt{1-y^2} = 1 \implies x= \frac{1-\sqrt{1-y^2}}{y}
$$

Now solving for y, we get

$$\frac{1-y}{1+\sqrt{1-y^2}}=\frac{1-\sqrt{1-y^2}}{y} \implies y(1-y)=(1-\sqrt{1-y^2})(1+\sqrt{1-y^2}) \implies y-y^2=y^2 \implies y=\frac{1}{2}$$

Plugging into the second equations with x, we get

$$x= 2\left(1-\sqrt{1-\frac{1}{4}}\right) = 2\left(\frac{2-\sqrt{3}}{2} \right) = \boxed{\textbf{(C)}\ 2-\sqrt{3}}$$

## Solution 3
Let BE = x, EK = a, and EJ = b. Then x^2 = a^2 + b^2 and because $\triangle KEJ$\cong $\triangle GDH$ and $\triangle KEJ \sim \triangle JAG, \frac{GA}{1} = 1 -$ a = $\frac{b}{x}.$ Furthermore, the area of the four triangles and the two rectangles sums to 1:

$$1 = 2x + GA\cdot JA + ab$$

$$1 = 2x + (1 - a)(1 - (x + b)) + ab$$

$$1 = 2x + \frac{b}{x}(1 - x - b) + \left(1 - \frac{b}{x}\right)b$$

$$1 = 2x + \frac{b}{x} - b - \frac{b^2}{x} + b - \frac{b^2}{x}$$

$$x = 2x^2 + b - 2b^2$$

$$x - b = 2(x - b)(x + b)$$

$$x + b = \frac{1}{2}$$

$$b = \frac{1}{2} - x$$

$$a = 1 - \frac{b}{x} = 2 - \frac{1}{2x}$$

By the Pythagorean theorem: $x^2 = a^2 + b^2$

$$x^2 = \left(2 - \frac{1}{2x}\right)^2 + \left(\frac{1}{2} - x\right)^2$$

$$x^2 = 4 - \frac{2}{x} + \frac{1}{4x^2} + \frac{1}{4} - x + x^2$$

$$0 = \frac{1}{4x^2} - \frac{2}{x} + \frac{17}{4} - x$$

$$0 = 1 - 8x + 17x^2 - 4x^3.$$

Then by the rational root theorem, this has roots $\frac{1}{4}, 2 - \sqrt{3},$ and 2 + $\sqrt{3}.$ The first and last roots are extraneous because they imply $a = 0$ and x > 1, respectively, thus $x =\boxed{\textbf{(C)}\ 2-\sqrt{3}}.$
## Solution 4
Let $\angle FKH =$ k and CF = a.  It is shown that all four triangles in the picture are similar.  From the square side lengths:

$$a + \sin(k) \cdot 1 + \cos(k) \cdot a = 1$$

$$\sin(k)a + \cos(k) = 1$$
Solving for a we get:

$$a = \frac{1-\sin(k)}{\cos(k) + 1} = \frac{1 - \cos(k)}{\sin(k)}$$

$$(1-\sin(k)) \cdot sin(k) = (1 - \cos(k))\cdot(\cos(k) + 1)$$

$$\sin(k)-\sin(k)^2 = \cos(k) + 1 - \cos(k)^2 - \cos(k)$$

$$\sin(k)-\sin(k)^2 = \sin(k)^2$$

$$1-\sin(k) = \sin(k)$$

$$\sin(k) = \frac{1}{2}, \cos(k) = \frac{\sqrt 3}{2}$$

$$a = \frac{1 - \frac{\sqrt 3}{2}}{\frac{1}{2}} = 2 - \sqrt 3$$
## Solution 5
Note that HJ is a diagonal of JKHG, so it must be equal in length to FB. Therefore, quadrilateral FHJB has FH\parallel BJ, and FB=HJ, so it must be either an isosceles trapezoid or a parallelogram. But due to the slope of FB and HJ, we see that it must be a parallelogram. Therefore, FH=BJ. But by the symmetry in rectangle FEAD, we see that FH=JA. Therefore, BJ=FH=JA. We also know that BJ+JA=1, hence BJ=JA=$\frac12.$

As JG=1 and JA=$\frac12,$ and as $\triangle GJA$ is right, we know that $\triangle GJA$ must be a 30-60-90 triangle. Therefore, GA=$\sqrt{3}/2$ and DG=1-$\sqrt{3}/2$. But by similarity, $\triangle DHG$ is also a 30-60-90 triangle, hence DH=$\sqrt{3}-3/2. But \triangle DHG$\cong$\triangle EJK,$ hence EJ=$\sqrt{3}-3/2$. As BJ=1/2, this implies that BE=BJ-EJ=1/2-$\sqrt{3}+3/2=2-\sqrt{3}.$ Thus the answer is $\boxed{\textbf{(C)}}.$
## Solution 6
Let BE = x, KE = y

$$DG = y, AG = 1-y, KJ = x, JG = 1$$

$$\frac{AJ}{JG} = \frac{KE}{JK}, AJ = \frac{y}{x}, EJ = 1 - x - \frac{y}{x},$$


$$\frac{AG}{JG} = \frac{EJ}{JK}, 1-y = \frac{1 - x - \frac{y}{x}}{x}, x - xy = 1 - x - \frac{y}{x}, 2x^2 - x^2y + y - x = 0 (1)$$


$$AJ^2 + AG^2 = JG^2, \left( \frac{y}{x} \right) ^2 + (1-y)^2 = 1, \frac{y^2}{x^2} + 1 - 2y + y^2 = 1, x^2 y -2x^2 + y = 0 (2)$$


$$(1) + (2), 2y - x = 0, y = \frac{x}{2}$$

Substitute y into (2) we get $x^2 \cdot \frac{x}{2} - 2 x^2 + \frac{x}{2} = 0,x^2 -4x + 1 = 0$


$$x = \frac{4 \pm \sqrt{16-4}}{2} = 2 \pm \sqrt{3}, as x < 1, x = \boxed{\textbf{(C)}2 - \sqrt{3}}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## See Also
