# 2016 AMC 12B Problem 13

## Problem
Alice and Bob live 10 miles apart. One day Alice looks due north from her house and sees an airplane. At the same time Bob looks due west from his house and sees the same airplane. The angle of elevation of the airplane is $30^\circ$ from Alice's position and $60^\circ$ from Bob's position. Which of the following is closest to the airplane's altitude, in miles?

$\textbf{(A)}\ 3.5 \qquad\textbf{(B)}\ 4 \qquad\textbf{(C)}\ 4.5 \qquad\textbf{(D)}\ 5 \qquad\textbf{(E)}\ 5.5$
## Solution
Let's set the altitude = z, distance from Alice to airplane's ground position (point right below airplane)=y and distance from Bob to airplane's ground position=x

From Alice's point of view, $\tan(\theta)=\frac{z}{y}. \tan{30}=\frac{\sin{30}}{\cos{30}}=\frac{1}{\sqrt{3}}.$ So, $y=z*\sqrt{3}$

From Bob's point of view, $\tan(\theta)=\frac{z}{x}. \tan{60}=\frac{\sin{60}}{\cos{60}}=\sqrt{3}.$ So, x = $\frac{z}{\sqrt{3}}$

We know that $x^2 + y^2 = 10^2$

Solving the equation (by plugging in x and y), we get $z=\sqrt{30} =$ about 5.5.

So, answer is E) 5.5

solution by sudeepnarala
## Solution 2 (Use One Variable)
We have two 30-60-90 triangles ABC and DBC that are perpendicular and share leg BC (the altitude of the plane p). AD=10 The shared leg is the shortest leg of one triangle and the longest leg of the other. A and B are Bob and Alice respectively.

Find AC and DC in terms of p. Use Pythagorean Theorem on triangle ADC to produce $p=\sqrt{30}\implies\boxed{\textbf{E)}\ 5.5}$

 **EXAMPLE**: Let angle A be 30 degrees and angle B be 60 degrees. AC=p$\sqrt{3},$ and DC=$\frac{p}{\sqrt{3}}$ by special triangle rules. By Pythagorean Theorem, AC^2+DC^2=AB^2, so ($p\sqrt{3})^2+(\frac{p}{\sqrt{3}})^2=10^2.p=\sqrt{30}$

(Solution by BJHHar)
## Solution 3
Non-trig solution by $e_power_pi_times_i$

Set the distance from Alice's and Bob's position to the point directly below the airplane to be x and y, respectively. From the Pythagorean Theorem, x^2 + y^2 = 100. As both are 30-60-90 triangles, the altitude of the airplane can be expressed as $\dfrac{x\sqrt{3}}{3}$ or $y\sqrt{3}.$ Solving the equation $\dfrac{x\sqrt{3}}{3} =y\sqrt{3},$ we get $x =3y$. Plugging this into the equation $x^2 + y^2 = 100,$ we get $10y^2 = 100$, or $y =\sqrt{10} (y$ cannot be negative), so the altitude is $\sqrt{3*10} = \sqrt{30},$ which is closest to $\boxed{\textbf{E)}\ 5.5}$
## Solution 4 (Formal)
Let Alice be at point A, Bob be at point B. Let the plane be at point P and X be the projection of P onto the ground (the plane with contains A and B). Let the height of the plane, or PX, be h. So, because of the 30-60-90 triangles,
$$AX = \dfrac{h}{\sqrt{3}}, BX = h\sqrt{3}$$
By [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) on $\triangle ABX,$

$$\dfrac{h^2}{3} + 3h^2 = 100 \implies \dfrac{10h^2}{3} = 100 \implies h = \sqrt{30},$$

which is clossest to $\boxed{\textbf{(E)}\ 5.5}.$

*~sml1809*
## Solution 5: Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; usepackage("amsmath"); size(7.2cm); real labelscalefactor = 0.5; /* changes label-to-point distance */ pen dps = linewidth(0.7) + fontsize(10); defaultpen(dps); /* default pen style */ pen dotstyle = black; /* point style */ real xmin = -4.3, xmax = 10.1, ymin = -4.44, ymax = 6.3; /* image dimensions */ pen qqwuqq = rgb(0.,0.39215686274509803,0.); draw((-0.12,5.52)--(-1.34,-0.82)--(4.78,-0.88)--cycle); draw(arc((-1.34,-0.82),0.6,41.93351449887411,79.10776933246521)--(-1.34,-0.82)--cycle, qqwuqq); draw(arc((4.78,-0.88),0.6,127.43857157233303,167.225815720283)--(4.78,-0.88)--cycle, qqwuqq); /* draw figures */ draw((-0.12,5.52)--(-1.34,-0.82)); draw((-1.34,-0.82)--(4.78,-0.88)); draw((4.78,-0.88)--(-0.12,5.52)); draw((-0.12,5.52)--(-0.16,0.24)); draw((-0.16,0.24)--(4.78,-0.88)); draw((-1.34,-0.82)--(-0.16,0.24)); label("$60^{\circ}$",(3.82,-0.06),SE*labelscalefactor); label("$\circ$",(-1.12,0.3),SE*labelscalefactor); draw((-0.15694767653526337,0.6429066973452366)--(0.22,0.58)); draw((0.22,0.58)--(0.21801530426333052,0.1542961253492044)); draw((-0.15694767653526337,0.6429066973452365)--(-0.44,0.4)); draw((-0.44,0.4)--(-0.42432750397456265,0.0025532591414946237)); draw((-0.42432750397456265,0.0025532591414946237)--(-0.16,0.24)); draw((-0.16,0.24)--(-0.42432750397456265,0.0025532591414946237)); draw((-0.42432750397456265,0.0025532591414946237)--(-0.02,-0.12)); draw((-0.02,-0.12)--(0.21801530426333054,0.15429612534920437)); /* dots and labels */ dot((-0.12,5.52),dotstyle); label("$\text{Plane}$", (-0.52,5.74), NE * labelscalefactor); dot((-1.34,-0.82),dotstyle); label("$\text{Alice}$", (-1.8,-1.2), NE * labelscalefactor); dot((4.78,-0.88),dotstyle); label("$\text{Bob}$", (4.86,-0.68), NE * labelscalefactor); clip((xmin,ymin)--(xmin,ymax)--(xmax,ymax)--(xmax,ymin)--cycle); /* end of picture */ label("$10$", (-1.8,-1.2)--(4.86,-0.68), S);
```


*~credit to mathmaster2012 for original diagram*

*~BakedPotato66 added/contributed some elements*
## Video Solution by CanadaMath (Problem 11-20)
Fast Forward to 9:16 for problem 13
https://www.youtube.com/watch?v=4osvFatUv1o

*~THEMATHCANADIAN*
## See Also
