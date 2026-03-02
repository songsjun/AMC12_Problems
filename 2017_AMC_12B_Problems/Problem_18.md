# 2017 AMC 12B Problem 18

## Problem
The diameter AB of a circle of radius 2 is extended to a point D outside the circle so that BD=3. Point E is chosen so that ED=5 and line ED is perpendicular to line AD. Segment AE intersects the circle at a point C between A and E. What is the area of $\triangle ABC$?

$\textbf{(A)}\ \frac{120}{37}\qquad\textbf{(B)}\ \frac{140}{39}\qquad\textbf{(C)}\ \frac{145}{39}\qquad\textbf{(D)}\ \frac{140}{37}\qquad\textbf{(E)}\ \frac{120}{31}$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Geogebra to Asymptote conversion, documentation at artofproblemsolving.com/Wiki, go to User:Azjps/geogebra */ import graph; size(8.865514650638614cm); real labelscalefactor = 0.5; /* changes label-to-point distance */ pen dps = linewidth(0.7) + fontsize(10); defaultpen(dps); /* default pen style */ pen dotstyle = black; /* point style */ real xmin = -6.36927122464312, xmax = 11.361758076634109, ymin = -3.789601803155515, ymax = 7.420015026296013; /* image dimensions */ draw((-2.,0.)--(0.6486486486486486,1.8918918918918919)--(2.,0.)--cycle); /* draw figures */ draw(circle((0.,0.), 2.)); draw((-2.,0.)--(5.,5.)); draw((5.,5.)--(5.,0.)); draw((5.,0.)--(-2.,0.)); draw((-2.,0.)--(0.6486486486486486,1.8918918918918919)); draw((0.6486486486486486,1.8918918918918919)--(2.,0.)); draw((2.,0.)--(-2.,0.)); draw((2.,0.)--(5.,5.)); draw((0.,0.)--(5.,5.)); /* dots and labels */ dot((0.,0.),dotstyle); label("$O$", (-0.10330578512396349,-0.39365890308038826), NE * labelscalefactor); dot((-2.,0.),dotstyle); label("$A$", (-2.2370398196844437,-0.42371149511645134), NE * labelscalefactor); dot((2.,0.),dotstyle); label("$B$", (2.045454545454548,-0.36360631104432517), NE * labelscalefactor); dot((5.,0.),dotstyle); label("$D$", (4.900450788880542,-0.42371149511645134), NE * labelscalefactor); dot((5.,5.),dotstyle); label("$E$", (5.06574004507889,5.15104432757325), NE * labelscalefactor); dot((0.6486486486486486,1.8918918918918919),linewidth(3.pt) + dotstyle); label("$C$", (0.48271975957926694,2.100706235912847), NE * labelscalefactor); clip((xmin,ymin)--(xmin,ymax)--(xmax,ymax)--(xmax,ymin)--cycle); /* end of picture */
```


Let O be the center of the circle. Note that EC + CA = EA = $\sqrt{AD^2 + DE^2} = \sqrt{(2+2+3)^2 + 5^2} = \sqrt{74}.$ However, by Power of a Point, (EC)(EC + CA) = EO^2 - R^2 = (2+3)^2 + 5^2 - $2^2 =25 + 25 - 4 = 46\implies EC = \frac{46}{\sqrt{74}},$ so AC = $\sqrt{74} - \frac{46}{\sqrt{74}} = \frac{28}{\sqrt{74}}.$ Now BC = $\sqrt{AB^2 - AC^2} = \sqrt{4^2 - \frac{28^2}{74}} = \sqrt{\frac{16 \cdot 74 - 28^2}{74}} = \sqrt{\frac{1184 - 784}{74}} = \frac{20}{\sqrt{74}}.$ Since $\angle ACB = 90^{\circ},$ [ABC] = $\frac{1}{2} \cdot BC \cdot AC = \frac{1}{2} \cdot \frac{20}{\sqrt{74}} \cdot \frac{28}{\sqrt{74}} = \boxed{\textbf{(D)}\ \frac{140}{37}}.$
## Solution 2: Similar triangles with Pythagorean
AB is the diameter of the circle, so $\angle ACB$ is a right angle, and therefore by AA similarity, $\triangle ACB \sim \triangle ADE.$

Because of this, $\frac{AC}{AD} = \frac{AB}{AE} \Longrightarrow \frac{AC}{2+2+3} = \frac{2+2}{\sqrt{7^2 + 5^2}},$ so AC = $\frac{28}{\sqrt{74}}.$

Likewise, $\frac{BC}{ED} = \frac{AB}{AE} \Longrightarrow \frac{BC}{5} = \frac{4}{\sqrt{74}},$ so BC = $\frac{20}{\sqrt{74}}.$

Thus the area of $\triangle ABC = \frac{1}{2} \cdot \frac{28}{\sqrt{74}} \cdot \frac{20}{\sqrt{74}} = \boxed{\textbf{(D)}\ \frac{140}{37}}.$
## Solution 2b: Area shortcut
Because AE is $\sqrt{74}$ and AB is 4, the ratio of the sides is $\frac{\sqrt{74}}{4},$ meaning the ratio of the areas is thus {($\frac{\sqrt{74}}{4})}^2 \implies \frac{74}{16} \implies \frac{37}{8}.$ We then have the proportion $\frac{\frac{5*7}{2}}{[ABC]}=\frac{37}{8} \implies $37*[ABC]=140 $\implies \boxed{\textbf{(D)}\ \frac{140}{37}}$
## Solution 3: Similar triangles without Pythagorean
Or, use similar triangles all the way, dispense with Pythagorean, and go for minimal calculation:

Draw BF \parallel ED with F on AE. BF=$5\times\frac{4}{7}=\frac{20}{7}.$

[$\triangle ABF$]=$\frac{1}{2} \times 4 \times \frac{20}{7}=\frac{40}{7}.$

AC:CB:CF=49:35:25.  (7:5 ratio applied twice)

[$\triangle ABC$]=$\frac{49}{49+25}$[$\triangle ABF$]=$\boxed{\textbf{(D)}\ \frac{140}{37}}.$
## Solution 4 (Coordinate Geometry)
Let A be at the origin (0, 0) of a coordinate plane, with B being located at (4, 0), etc.

We can find the area of $\triangle ABC$ by finding the the altitude from line AB to point C. Realize that this altitude is the y coordinate of point C on the coordinate plane, since the respective base of $\triangle ABC$ is on the x-axis.

Using the diagram in solution one, the equation for circle O is $(x-2)^2+y^2 = 4.$

The equation for line AE is then y = $\frac{5}{7}$x, therefore x = $\frac{7}{5}$y.

Substituting $\frac{7}{5}$y for x in the equation for circle O, we get:

$$\left(\frac{7}{5}y-2\right)^2+y^2 = 4$$

We can solve for y to yield the y coordinate of point C in the coordinate plane, since this is the point of intersection of the circle and line AE. Note that one root will yield the intersection of the circle and line AE at the origin, so we will ignore this root.

Expanding the expression and factoring, we get:

$$\left(\frac{49}{25}y^2-\frac{28}{5}y+4\right)+y^2 = 4$$

$$\frac{74}{25}y^2-\frac{28}{5}y = 0$$

$$50y(37y-70) = 0$$

Our non-zero root is thus $\frac{70}{37}.$ Calculating the area of $\triangle ABC$ with 4 as the length of AB and $\frac{70}{37}$ as the altitude, we get:

$$\frac{(4)(\frac{70}{37})}{2} = \boxed{\textbf{(D)}\ \frac{140}{37}}.$$

*~Solution by Joeya*
## Solution 5 (No sqrts)
Slope of AC is 5/7
As stated in other solutions AB is the diameter, ABC is right.

Let CF be an altitude of ABC.

AF:CF = CF:BF = 7:5

We can set AF = 49, CF = 35, BF = 25 and scale back later

Then the radius is $\frac{AB}{2} = \frac{AF+BF}{2} = \frac{74}{2} = 37.$

So the radius is 37 and the height of ABC is 35.

If we scale it back so that our radius is 2, our height is $\frac{70}{37}.$

Area of ABC is bh/2 = $\frac{(4)(\frac{70}{37})}{2} = \boxed{\textbf{(D)}\ \frac{140}{37}}.$

*~mathophobia*
## Video Solution by OmegaLearn (Similar Triangles)
https://youtu.be/NsQbhYfGh1Q?t=512

*~pi_is_3.14*
## See Also
