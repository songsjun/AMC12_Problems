# 2013 AMC 12B Problem 24

## Problem
Let ABC be a triangle where M is the midpoint of $\overline{AC},$ and $\overline{CN}$ is the angle bisector of $\angle{ACB}$ with N on $\overline{AB}.$ Let X be the intersection of the median $\overline{BM}$ and the bisector $\overline{CN}.$ In addition $\triangle BXN$ is equilateral with AC=2. What is $BN^2$?

$\textbf{(A)}\ \frac{10-6\sqrt{2}}{7} \qquad \textbf{(B)}\ \frac{2}{9} \qquad \textbf{(C)}\ \frac{5\sqrt{2}-3\sqrt{3}}{8} \qquad \textbf{(D)}\ \frac{\sqrt{2}}{6} \qquad \textbf{(E)}\ \frac{3\sqrt{3}-4}{5}$
## Solution 1
Let BN=x and NA=y. From the conditions, let's deduct some convenient conditions that seem sufficient to solve the problem.

**M is the midpoint of side AC.**

This implies that [ABX]=[CBX]. Given that angle ABX is 60 degrees and angle BXC is 120 degrees, we can use the area formula to get


$$\frac{1}{2}(x+y)x \frac{\sqrt{3}}{2} = \frac{1}{2} x \cdot CX \frac{\sqrt{3}}{2}$$


$$So, x+y=CX .....(1)$$

**CN is angle bisector.**

In the triangle ABC, one has BC/AC=x/y, therefore BC=$2x$/y.....(2)

Furthermore, triangle BCN is similar to triangle MCX, so BC/CM=CN/CX, therefore BC = (CX+x)/CX = ($2x$+y)/(x+y)....(3)

By (2) and (3) and the subtraction law of ratios, we get

$$BC=2x/y = (2x+y)/(y+x) = y/x$$

Therefore $2x^2=y^2,$ or $y=\sqrt{2}$x. So BC = $2x/(\sqrt{2}$x) = $\sqrt{2}.$

Finally, using the law of cosine for triangle BCN, we get


$$2 = BC^2 = x^2 + (2x+y)^2 - x(2x+y) = 3x^2 + 3xy + y^2 = \left(5+3\sqrt{2}\right)x^2$$


$$x^2 = \frac{2}{5+3\sqrt{2}} = \boxed{\textbf{(A) }\frac{10-6\sqrt{2}}{7}}.$$
## Solution 2 (Analytic)
[File:2013 AMC 12B 24.jpg](https://artofproblemsolving.com/wiki/index.php/File:2013_AMC_12B_24.jpg)

Let us dilate triangle ABC so that the sides of equilateral triangle BXN are all equal to 2. The purpose of this is to ease the calculations we make in the problem. Given this, we aim to find the length of segment AM so that we can un-dilate triangle ABC by dividing each of its sides by AM. Doing so will make it so that AM = 1, as desired, and doing so will allow us to get the length of BN, whose square is our final answer.

Let O the foot of the altitude from B to NX. On the coordinate plane, position O at (0, 0), and make NX lie on the x-axis. Since points N, X, and C, are collinear, C must also lie on the x-axis. Additionally, since NX = 2, OB = $\sqrt{3},$ meaning that we can position point B at (0, $\sqrt{3}).$ Now, notice that line $\overline{AB}$ has the equation $y =\sqrt{3}$x + $\sqrt{3}$ and that line $\overline{BM}$ has the equation $y =-\sqrt{3}$x + $\sqrt{3}$ because angles BNX and BXN are both $60^{\circ}$. We can then position A at point (n, $\sqrt{3}(n + 1))$ and C at point (p, 0). Quickly note that, because CN is an angle bisector, AC must pass through the point (0, $-\sqrt{3}).$

We proceed to construct a system of equations. First observe that the midpoint M of AC must lie on BM, with the equation $y =-\sqrt{3}$x + $\sqrt{3}.$ The coordinates of M are $\left(\frac{p + n}{2}, \frac{\sqrt{3}}{2}(n + 1)\right),$ and we can plug in these coordinates into the equation of line BM, yielding that $\frac{\sqrt{3}}{2}(n + 1) = -\sqrt{3}(\frac{p + n}{2}) + \sqrt{3} \implies$ n + 1 = -p - n + 2 $\implies$ p = -$2n + 1$. For our second equation, notice that line AC has equation $y =\frac{\sqrt{3}}{p}$x - $\sqrt{3}.$ Midpoint M must also lie on this line, and we can substitute coordinates again to get $\frac{\sqrt{3}}{2}(n + 1) = \frac{\sqrt{3}}{p}(\frac{p + n}{2}) - \sqrt{3} \implies$ n + $1 =\frac{p + n}{p} - 2 \implies$ n + $1 =\frac{n}{p} - 1 \impliesp =\frac{n}{n + 2}.$

Setting both equations equal to each other and multiplying both sides by (n + 2), we have that -$2n^2-$4n + n + 2 = n $\implies -2n^2 - 4n + 2 = 0$, which in turn simplifies into $0 = n^2 +2n - 1$ when dividing the entire equation by -2. Using the quadratic formula, we have that $n =\frac{-2 \pm \sqrt{4 + 4}}{2} = -1 - \sqrt{2}.$ Here, we discard the positive root since A must lie to the left of the y-axis. Then, the coordinates of C are (3 + $2\sqrt{2}, 0),$ and the coordinates of A are (-1 - $\sqrt{2}, -\sqrt{6}).$ Seeing that segment AM has half the length of side AC, we have that the length of AM is $\frac{\sqrt{(3 + 2\sqrt{2} - (-1 - \sqrt{2}))^2 + (\sqrt{6})^2}}{2} = \frac{\sqrt{16 + 24\sqrt{2} + 18 + 6}}{2} = \sqrt{10 + 6\sqrt{2}}.$

Now, we divide each side length of $\triangle ABC$ by AM, and from this, BN^2 will equal $\left(\frac{2}{\sqrt{10 + 6\sqrt{2}}}\right)^2 = \frac{2}{5+3\sqrt{2}} = \boxed{\textbf{(A) }\frac{10-6\sqrt{2}}{7}.}$
## Solution 3
By some angle-chasing, we find that $\triangle ANC \sim \triangle BXC.$ From here, construct a point D on AC such that $\triangle DXC \sim \triangle ANC.$ Now, let BC = a, which means that DM = a - 1 and AD = 2 - a, and let BN = BX = XN = XD = DN = b. Note that we want to compute b^2. Because $\triangle AND \sim \triangle DXM,$ we have:

$$\frac{AN}{2-a} = \frac{b}{a-1} \implies AN = \frac{b(2-a)}{(a-1)}$$

However, we have more similar triangles. In fact, going back to our original pair of similar triangles - $\triangle ANC$ and $\triangle BXC -$ gives us more similarity ratios:


$$\frac{AN}{AC} = \frac{BX}{BC} \implies \frac{\frac{b(2-a)}{(a-1)}}{2} = \frac{b}{a} \implies a = \sqrt{2}$$


Since we constructed point D such that DX is parallel to AB, we now examine trapezoid ABXD. From the variables that we already set up, we know that AB = b + $b\sqrt{2}, BX = XD =$ b, and DA = 2 - $\sqrt{2}.$ Let X' denote the foot of the perpendicular from X to base AB and define D' similarly.

Because $\triangle BXX$' is a 30, 60, 90 triangle, XX' = $\frac{b\sqrt{3}}{2}$ and BX' = $\frac{b}{2}.$ Thus, D'A = $b\sqrt{2} - \frac{b}{2}$ and DD' = XX' = $\frac{b\sqrt{3}}{2}.$ By the Pythagorean Theorem on $\triangle ADD$',


$$\left (b\sqrt{2} - \frac{b}{2} \right)^2 + \left(\frac{b\sqrt{3}}{2} \right)^2 = \left(2 - \sqrt{2} \right)^2 \implies b^2 = \boxed{\textbf{(A) } \frac{10-6\sqrt{2}}{7}}.$$

## Solution 4
Since $\triangle BXN$ is equilateral, let's assume the sides of them are all a, and denote the length of XM is m. Since CN bisects $\angle BCA,$ applying the angle bisector theorem and we can get BC=$\frac{a}{m}$;AN=$2m$. Now applying LOC, we can get ($a+2m)^2+(a+m)^2-2(a+2m)(a+m)\cos\frac{\pi}{3}=1.$ We get $a^2+3m^2+3$am=1. Now applying the Stewart theorem in $\triangle BAC,$ we can find that {$\frac{a^2}{m^2}+(a+2m)^2=2(1+(a+m)^2)$}, after simplifying, we get {$\frac{a^2}{m^2}-a^2+2$m^2=2}. After observation, the main key for this problem is $a^2,$ so we can solve a in term of m. Let's see the equation {$\frac{a^2}{m^2}-a^2+2m^2=2},$ we can find that $a=\sqrt{2}$m so $a^2=2m^2$. Now back solving the first equation we can get that $a=\frac{-3m+\sqrt{4-3m^2}}{m}$cuz the negative one can't work. After solving, we can get that $m^2=\frac{1}{5+3\sqrt{2}}$ so $a^2=2m^2$ and we get $a^2 =\boxed{\textbf{(A) } \frac{10-6\sqrt{2}}{7}}$~ bluesoul
## Solution 5 (Similar Triangles)
Denote the length of AN as a and the length of NB as b.

Let M' be the midpoint of $\overline{BC}$ . Denote the intersection of $\overline{MM'}$ and $\overline{CN}$ as X' . Note that MX' = $\frac12 AN = \frac{a}{2}$ and CN = $2\cdot NX$' . As $\overline{MM'}$ || $\overline{AB},$ we have that $\triangle MXX$' $\sim \triangle BXN$ or $\triangle MXX$' is equilateral and XX' =MX' = $\frac{a}{2}.$ Thus, CN = $2b$+a and CX=a+b.

Observe that

$\triangle BXC\sim \triangle ANC \implies \frac{BX}{XC} =\frac{AN}{NC} \implies \frac{b}{b+a} = \frac{a}{2b+a} \implies$ a = $\sqrt 2$ b.

By the angle bisector theorem, we have that BC=$\frac{2b}{a} = \sqrt 2.$

We apply the Law of Cosines on $\triangle BXC$ as follows:

$$
BC^2=BX^2+XC^2-2BX\cdot XC\cdot \cos120^\circ
\begin{align*} 2&=b^2+(\sqrt 2+1)^2b^2 +(\sqrt2 + 1)b^2 \\ &=b^2(5+3\sqrt 2) \end{align*}
$$

or
$$\boxed{b^2=\textbf{(A) } \frac{10-6\sqrt{2}}{7}}$$

*~ASAB*
## Solution 6
[center|500px](https://artofproblemsolving.com/wiki/index.php/File:2013AMC12BProblem24Solution6.png)

$\angle BXC = \angle ANC, \angle BCX = \angle ACN, \triangle BCX \sim \triangle ACN, \frac{CX}{CN} = \frac{BC}{AC}$

$\angle MBC = \angle BAC, \angle BCM = \angle ACB, \triangle BCM \sim \triangle ACB, \frac{BC}{AC} = \frac{CM}{BC}, BC = \sqrt{2}$

Let BX = x, CN = CX + x, $\frac{CX}{CX + x} = \frac{\sqrt{2}}{2}, 2CX = CX \sqrt{2} +$ x $\sqrt{2}, CX =$ x($\sqrt{2} + 1)$

$$BC^2 = BX^2 + CX^2 - 2 \cdot BX \cdot CX \cdot \cos 120^\circ$$

$$2 = x^2(\sqrt{2} + 1)^2 + x^2 + x^2(\sqrt{2} + 1) = 5x^2 + 3x^2 \sqrt{2}$$

$$x^2 = \frac{2}{5 + 3 \sqrt{2} } = \boxed{\textbf{(A) }\frac{10-6\sqrt{2}}{7}}$$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7
Let BN = m and AN = n. Let BC = a. It's known that AM = MC = 1. By the Angle Bisector Theorem:


$$\frac{BN}{AN} = \frac{BC}{AC} \implies \frac{m}{n} = \frac{a}{2} \implies n = \frac{2m}{a}.$$


Now we will apply the Angle Bisector Theorem again on triangle BCM. Hence:

$\frac{BC}{CM} = \frac{BX}{MC}$ Since BNX is equilateral, BN = BX = m. Let MX = k. Hence we proceed with:

$$\frac{a}{1} = \frac{m}{k} \implies k = \frac{m}{a}$$

We will now use the Law of Sines on triangle BXC by first denoting $\angle BCN = \angle ACN = \theta.$ Hence:

$\frac{\sin(\theta)}{m} = \frac{\sin(\pi - \frac{\pi}{3})}{a}$ since equilateral triangles have radian measures of $\frac{\pi}{3}$ and N, X, C are collinear. We simplify this keeping in mind that $\sin(\pi - \frac{\pi}{3}) = \sin(\frac{2\pi}{3}) = \frac{\sqrt{3}}{2}.$ Therefore:

$$\sin(\theta) = \frac{m\sqrt{3}}{2a}$$

We will now find $\cos(2\theta).$ By the double-angle identity:


$$\cos(2\theta) = 1 - 2\sin^{2}(\theta) = 1 - 2(\frac{m\sqrt{3}}{2a})^{2} = 1 - \frac{3m^{2}}{2a^{2}}.$$


We will now use Law of Cosines on triangle BMC. We proceed to get:

$$a^{2} + 1 - 2a\cos(2\theta) = (m + \frac{m}{a})^{2}$$


$$\implies a^{2} + 1 - 2a(1 - \frac{3m^{2}}{2a^{2}}) = m^{2} + \frac{2m^{2}}{a} + \frac{m^{2}}{a^{2}}$$


$$\implies a^{2} + 1 - 2a + \frac{3m^{2}}{a} = m^{2} + \frac{2m^{2}}{a} + \frac{m^{2}}{a^{2}}$$


$$\implies m^{2} + \frac{m^{2}}{a^{2}} = a^{2} + 1 - 2a + \frac{m^{2}}{a}$$

We will now use Law of Cosines again on triangle ABC. We proceed to get:

$$a^{2} + 4 - 4a\cos(2\theta) = (m + \frac{2m}{a})^{2}$$


$$\implies a^{2} + 4 - 4a(1 - \frac{3m^{2}}{2a^{2}}) = m^{2} + \frac{4m^{2}}{a} + \frac{4m^{2}}{a^{2}}$$


$$\implies a^{2} + 4 - 4a + \frac{6m^{2}}{a} = m^{2} + \frac{4m^{2}}{a} + \frac{4m^{2}}{a^{2}}$$


$$\implies m^{2} + \frac{4m^{2}}{a^{2}} = a^{2} + 4 - 4a + \frac{2m^{2}}{a}$$

From this new recent equation, we get:

$$m^{2} - a^{2} = 4 - 4a + \frac{2m^{2}}{a} - \frac{4m^{2}}{a^{2}}$$

From the last equation we found, we can get:

$$m^{2} - a^{2} = 1 - 2a + \frac{m^{2}}{a} - \frac{m^{2}}{a^{2}}$$

So we get:


$$4 - 4a + \frac{2m^{2}}{a} - \frac{4m^{2}}{a^{2}} = 1 - 2a + \frac{m^{2}}{a} - \frac{m^{2}}{a^{2}}$$


$$\implies 3 + \frac{2m^{2}}{a} - \frac{4m^{2}}{a^{2}} = 2a + \frac{m^{2}}{a} - \frac{m^{2}}{a^{2}}$$


$$\implies 3 = 2a - \frac{m^{2}}{a} + \frac{3m^{2}}{a^{2}}$$

We will use Law of Cosines one last time on triangle ABM noting that AB = BN + AN = m + $\frac{2m}{a}$ and BM = BX + XM = m + $\frac{m}{a}$

We have:


$$(m + \frac{2m}{a})^{2} + (m + \frac{m}{a})^{2} - 2(m + \frac{2m}{a})(m + \frac{m}{a})\cos(\frac{\pi}{3}) = 1$$


We can simplify this to get:

$$m^{2} + \frac{3m^{2}}{a} + \frac{3m^{2}}{a^{2}} = 1$$

Now we are ready to solve:

$$3 = 2a - \frac{m^{2}}{a} + \frac{3m^{2}}{a^{2}} (1)$$

$$m^{2} + \frac{3m^{2}}{a} + \frac{3m^{2}}{a^{2}} = 1 (2)$$

Note that we can write:

$$\frac{3m^{2}}{a^{2}} = 3 - 2a + \frac{m^{2}}{a}$$

$$\frac{3m^{2}}{a^{2}} = 1 - m^{2} - \frac{3m^{2}}{a}$$

Hence, 3 - $2a+\frac{m^{2}}{a} = 1 -m^{2}-\frac{3m^{2}}{a} \implies 2a - 2 =\frac{4m^{2}}{a} +m^{2}$

From this new equation we can solve for $m^{2}$ to get:

$$m^{2} = \frac{2a - 2}{\frac{4}{a} + 1}$$

From equation (2), we can also solve for $m^{2}$ to get:

$$m^{2} = \frac{1}{1 + \frac{3}{a} + \frac{3}{a^{2}}}$$

Hence:

$$\frac{2a - 2}{\frac{4}{a} + 1} = \frac{1}{1 + \frac{3}{a} + \frac{3}{a^{2}}}$$

We can clear fractions and cross multiply to get:


$$(2a^{2} - 2a)(a^{2} + 3a + 3) = a^{2}(a + 4) \implies (2a - 2)(a^{2} + 3a + 3) = a(a + 4) = a^{2} + 4a$$


Hence:

$$2a^{3} + 4a^{2} - 6 = a^{2} + 4a \implies 2a^{3} + 3a^{2} - 4a - 6 = 0$$

Magnificently, we can factor this! We get:

$(a^{2} - 2)(2a + 3) = 0$ following factoring by grouping

Now, it's clear $a =\pm \sqrt{2}, -\frac{3}{2}$ Since a is a side length, only $a =\sqrt{2}$ makes sense. Remember, the problem asked for $m^{2}=\frac{2a - 2}{\frac{4}{a} + 1} = \frac{2\sqrt{2} - 2}{2\sqrt{2} + 1} = \frac{10 - 6\sqrt{2}}{7}$ so our answer is (A).

*~ilikemath247365*
## Video Solution by MOP 2024
https://youtu.be/y0s6OTQ7KfI

*~r00tsOfUnity*
## See also
