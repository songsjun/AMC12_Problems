# 2023 AMC 12A Problem 11

## Problem
What is the degree measure of the acute angle formed by lines with slopes 2 and $\frac{1}{3}$?

$\textbf{(A)} ~30\qquad\textbf{(B)} ~37.5\qquad\textbf{(C)} ~45\qquad\textbf{(D)} ~52.5\qquad\textbf{(E)} ~60$
## Solution 1
Remind that $\text{slope}=\dfrac{\Delta y}{\Delta x}=\tan \theta$ where $\theta$ is the angle between the slope and x-axis. k_$1=2=\tan \alpha,$ k_$2=\dfrac{1}{3}=\tan \beta.$ The angle formed by the two lines is $\alpha-\beta. \tan(\alpha-\beta)=\dfrac{\tan\alpha-\tan\beta}{1+\tan\alpha\tan\beta}=\dfrac{2-1/3}{1+2\cdot 1/3}=1.$ Therefore, $\alpha-\beta=\boxed{\textbf{(C)} 45^\circ}.$

*~plasta*
## Solution 2
We can take any two lines of this form, since the angle between them will always be the same. Let's take $y=2x$ for the line with slope of 2 and $y=\frac{1}{3}$x for the line with slope of 1/3. Let's take 3 lattice points and create a triangle. Let's use (0,0), (1,2), and (3,1). The distance between the origin and (1,2) is $\sqrt{5}.$ The distance between the origin and (3,1) is $\sqrt{10}.$ The distance between (1,2) and (3,1) is $\sqrt{5}.$ We notice that we have a triangle with 3 side lengths: $\sqrt{5}, \sqrt{5},$ and $\sqrt{10}.$ This forms a 45-45-90 triangle, meaning that the angle is $\boxed{45^\circ}.$

*~lprado*
## Solution 2.b
WLOG, allow the line with slope 2 to pass through point O = (0, 0) and point A = (1, 2), and the line with slope $\frac{1}{3}$ to pass through point O and point B = (3, 1). Notice that the slope of line $\overline{AB}$ is $\frac{1 - 2}{3 - 1} = -\frac{1}{2}$ and is hence perpendicular to line $\overline{OA}.$ Drawing $\triangle OAB,$ we have $\overline{OA} = \overline{AB} = \sqrt{(1)^2 + (2)^2} = \sqrt{5},$ so $\triangle OAB$ is an isosceles right triangle. Therefore, the desired angle is $\angle AOB = \boxed{\textbf{(C)}\ 45^\circ}.$

*~ka-maths*
## Solution 3 (Law of Cosines)
Follow Solution 2 up until the lattice points section. Let's use (0,0), (2,4), and (9,3). The distance between the origin and (2,4) is $\sqrt{20}.$ The distance between the origin and (9,3) is $\sqrt{90}.$ The distance between (2,4) and (9,3) is $\sqrt{50}.$ Using the Law of Cosines, we see the 50 = 90 + 20 - $2\times\sqrt{20} \times\sqrt{90} \times\cos(\theta),$ where $\theta$ is the angle we are looking for.

Simplifying, we get -60 = $-2\times(\sqrt{20}) \times(\sqrt{90}) \times\cos(\theta).$

$$30 = \sqrt{1800} \times\cos(\theta).$$

$$30 = 30\sqrt{2} \times\cos(\theta).$$

$$\frac{1}{\sqrt{2}} = \frac{\sqrt{2}}{2}= \cos(\theta).$$

Thus, $\theta = \boxed{\textbf{(C)} 45^\circ}$

*~Failure.net*
## Solution 4 (Vector Bash)
We can set up vectors $\vec{a} = <1,2>$ and $\vec{b} = <3,1>$ to represent the two lines. We know that $\frac{\vec{a} \cdot \vec{b}}{|\vec{a}| |\vec{b}|} = \cos \theta.$ Plugging the vectors in gives us $\cos \theta = \frac{5}{5\sqrt{2}} = \frac{1}{\sqrt{2}}.$  From this we get that $\theta = \boxed{\textbf{(C)} 45^\circ}.$

*~middletonkids*
## Solution 5 (Complex Numbers)
Let $Z_1 = 3$ + i and $Z_2 = 1+2i$

$$
\begin{align*} Z_2 &= Z_1 \cdot re^{i\theta} \\ 1+2i&=(3+i) \cdot re^{i\theta} \\ 1+2i&=(3 + i) \cdot r(\cos\theta + i\sin\theta) \\ 1+2i&=3r\cos\theta - r\sin\theta + 3ri\sin\theta + ri\cos\theta \\ \end{align*}
$$


From this we have:

$$
\begin{align} 1 &= 3r\cos\theta - r\sin\theta \\ 2 &= r\cos\theta + 3r\sin\theta \end{align}
$$


To solve this we must compute r

$$
\begin{align*} r &= \frac{|Z_2|}{|Z_1|} \\ &= \frac{\sqrt{5}}{\sqrt{10}} \\ &= \frac{\sqrt{2}}{2} \end{align*}
$$


Using elimination we have:

$$
3\cdot(2) - (1)
\begin{align*} 5 &= 10r\sin\theta \\ \frac{1}{2r} &= \sin\theta \\ \frac{1}{2\frac{\sqrt{2}}{2}} &= \sin\theta \\ \frac{\sqrt{2}}{2} &= \sin\theta \\ \theta &= \boxed{\textbf{(C)} 45^\circ} \\ \end{align*}
$$


~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 5.b (Complex Numbers - Simpler)
Let $Z_1 = 3$ + i and $Z_2 = 1+2i$

$$
\begin{align*} Z_2 &= Z_1 \cdot re^{i\theta} \\ 1+2i &=(3+i) \cdot re^{i\theta} \\ \frac{1+2i}{3+i} &= re^{i\theta} \\ \frac{(1+2i)(3-i)}{(3+i)(3-i)} &= re^{i\theta} \\ \frac{3+2+6i-i}{(3+i)(3-i)} &= re^{i\theta} \\ tan(\theta) &= 5/5 \\ \theta &= \boxed{\textbf{(C)} 45^\circ} \\ \end{align*}
$$


~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 6
The lines $y =2x, y =\frac$ {1}{3}x, and $x = 3$ form a large right triangle and a small right triangle. Call the angle that is formed by the x-axis and the line $y =2x\alpha,$ and call the angle that is formed by the x-axis and the line $y =\frac$ {1}{3}x $\beta.$ We try to find $\sin (\alpha - \beta)$ first, and then try to see if any of the answer choices match up.

$$\sin (\alpha - \beta) = \sin \alpha \cos \beta - \sin \beta \cos \alpha.$$

Using soh-cah-toa, we find that $\sin \alpha = \frac$ {2}{$\sqrt 5}, \sin \beta = \frac$ {1}{$\sqrt 10}, \cos \alpha = \frac$ {1}{$\sqrt 5$},  and $\cos \beta = \frac$ {3}{$\sqrt 10$}.

Plugging it all in, we find that $\sin (\alpha - \beta) = \frac$ {5}{$\sqrt$ {50}}, which is equivalent to $\frac$ {$\sqrt 2$}{2}. Since $\sin (\alpha - \beta) = \frac$ {$\sqrt 2$}{2}, we get that $\alpha - \beta = 45^{\circ}.$ Therefore, the answer is $\boxed$ {$\textbf$ {(C)} $45^{\circ}$}.

*~Arcticturn*

# Solution 7 (Cheese)
AMC 12 does not allow graph paper or protractor. https://amc-reg.maa.org/manual/AMC1012B.pdf

Using a makeshift ruler, draw an accurate to-scale diagram. You can do this by simply drawing the two lines such that they intersect at the origin. Then, measure the angle by eye or by folding paper to observe that they form a 45 degree angle.
The answer is $\boxed{45^\circ}.$

*~InstallHelp_Hex*
## Video Solution (easy to digest) by Power Solve
https://youtu.be/YXIH3UbLqK8?si=Uh4K33tNEzBOXc_h&t=1406
## Video Solution (Under 4 minutes)
https://youtu.be/PWBEUXTtUxI

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/kPcsTZpFzTY

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by Math4All999 (pretty easy)
https://youtu.be/sa2HHgMZjSg?feature=shared
## See also
