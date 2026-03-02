# 2022 AMC 12B Problem 24

## Problem
The figure below depicts a regular 7-gon inscribed in a unit circle.

> [Asymptote diagram - not rendered in Markdown]

```asy
import geometry; unitsize(3cm); draw(circle((0,0),1),linewidth(1.5)); for (int $i = 0$; i < 7; ++i) { for (int $j = 0$; j < i; ++j) { draw(dir(i * 360/7) -- dir(j * 360/7),linewidth(1.5)); } } for(int $i = 0$; i < 7; ++i) { dot(dir(i * 360/7),5+black); }
```

What is the sum of the 4th powers of the lengths of all 21 of its edges and diagonals?

$\textbf{(A) }49 \qquad \textbf{(B) }98 \qquad \textbf{(C) }147 \qquad \textbf{(D) }168 \qquad \textbf{(E) }196$
## Solution 1 (Complex Numbers)
There are 7 segments whose lengths are 2 $\sin \frac{\pi}{7}, 7$ segments whose lengths are 2 $\sin \frac{2 \pi}{7}, 7$ segments whose lengths are 2 $\sin \frac{3\pi}{7}.$

Therefore, the sum of the 4th powers of these lengths is

$$
\begin{align*} 7 \cdot 2^4 \sin^4 \frac{\pi}{7} + 7 \cdot 2^4 \sin^4 \frac{2 \pi}{7} + 7 \cdot 2^4 \sin^4 \frac{3 \pi}{7} & = \frac{7 \cdot 2^4}{(2i)^4} \left( e^{i \frac{\pi}{7}} - e^{i \frac{-\pi}{7}} \right)^4 + \frac{7 \cdot 2^4}{(2i)^4} \left( e^{i \frac{2 \pi}{7}} - e^{i \frac{-2 \pi}{7}} \right)^4 + \frac{7 \cdot 2^4}{(2i)^4} \left( e^{i \frac{3 \pi}{7}} - e^{i \frac{-3 \pi}{7}} \right)^4 \\ & = 7 \left( e^{i \frac{4 \pi}{7}} - 4 e^{i \frac{2 \pi}{7}} + 6 - 4 e^{- i \frac{2 \pi}{7}} + e^{- i \frac{4 \pi}{7}} \right) \\ & \quad + 7 \left( e^{i \frac{8 \pi}{7}} - 4 e^{i \frac{4 \pi}{7}} + 6 - 4 e^{- i \frac{4 \pi}{7}} + e^{- i \frac{8 \pi}{7}} \right) \\ & \quad + 7 \left( e^{i \frac{12 \pi}{7}} - 4 e^{i \frac{6 \pi}{7}} + 6 - 4 e^{- i \frac{6 \pi}{7}} + e^{- i \frac{12 \pi}{7}} \right) \\ & = 7 \left( e^{i \frac{4 \pi}{7}} + e^{i \frac{8 \pi}{7}} + e^{i \frac{12 \pi}{7}} + e^{-i \frac{4 \pi}{7}} + e^{-i \frac{8 \pi}{7}} + e^{-i \frac{12 \pi}{7}} \right) \\ & \quad - 7 \cdot 4 \left( e^{i \frac{2 \pi}{7}} + e^{i \frac{4 \pi}{7}} + e^{i \frac{6 \pi}{7}} + e^{-i \frac{2 \pi}{7}} + e^{-i \frac{4 \pi}{7}} + e^{-i \frac{6 \pi}{7}} \right) \\ & \quad + 7 \cdot 6 \cdot 3 \\ & = 7 \left( e^{i \frac{4 \pi}{7}} + e^{-i \frac{6 \pi}{7}} + e^{-i \frac{2 \pi}{7}} + e^{-i \frac{4 \pi}{7}} + e^{i \frac{6 \pi}{7}} + e^{i \frac{2 \pi}{7}} \right) \\ & \quad - 7 \cdot 4 \left( e^{i \frac{2 \pi}{7}} + e^{i \frac{4 \pi}{7}} + e^{i \frac{6 \pi}{7}} + e^{-i \frac{2 \pi}{7}} + e^{-i \frac{4 \pi}{7}} + e^{-i \frac{6 \pi}{7}} \right) \\ & \quad + 7 \cdot 6 \cdot 3 \\ & = -7 + 7 \cdot 4 + 7 \cdot 6 \cdot 3 \\ & = \boxed{\textbf{(C) }147}, \end{align*}
$$

where the fourth from the last equality follows from the property that

$$
\begin{align*} e^{i \frac{2 \pi}{7}} + e^{i \frac{4 \pi}{7}} + e^{i \frac{6 \pi}{7}} + e^{-i \frac{2 \pi}{7}} + e^{-i \frac{4 \pi}{7}} + e^{-i \frac{6 \pi}{7}} & = e^{-i \frac{6 \pi}{7}} \sum_{j=0}^6 e^{i \frac{2 \pi j}{7}} - 1 \\ & = 0 - 1 \\ & = -1 . \end{align*}
$$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*

*~edited by scinderella220*
## Solution 2 (Trigonometry)
There are 7 segments whose lengths are 2 $\sin \frac{\pi}{7}, 7$ segments whose lengths are 2 $\sin \frac{2 \pi}{7}, 7$ segments whose lengths are 2 $\sin \frac{3\pi}{7}.$

Therefore, the sum of the 4th powers of these lengths is

$$
\begin{align*} & 7 \cdot 2^4 \sin^4 \frac{\pi}{7} + 7 \cdot 2^4 \sin^4 \frac{2 \pi}{7} + 7 \cdot 2^4 \sin^4 \frac{3 \pi}{7} \\ & = 7 \cdot 2^4 \left( \frac{1 - \cos \frac{2 \pi}{7}}{2} \right)^2 + 7 \cdot 2^4 \left( \frac{1 - \cos \frac{4 \pi}{7}}{2} \right)^2 + 7 \cdot 2^4 \left( \frac{1 - \cos \frac{6 \pi}{7}}{2} \right)^2 \\ & = 7 \cdot 2^2 \left( 1 - 2 \cos \frac{2 \pi}{7} + \cos^2 \frac{2 \pi}{7} \right) + 7 \cdot 2^2 \left( 1 - 2 \cos \frac{4 \pi}{7} + \cos^2 \frac{4 \pi}{7} \right) + 7 \cdot 2^2 \left( 1 - 2 \cos \frac{6 \pi}{7} + \cos^2 \frac{6 \pi}{7} \right) \\ & = 7 \cdot 2^2 \cdot 3 - 7 \cdot 2^3 \left( \cos \frac{2 \pi}{7} + \cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} \right) + 7 \cdot 2^2 \left( \cos^2 \frac{2 \pi}{7} + \cos^2 \frac{4 \pi}{7} + \cos^2 \frac{6 \pi}{7} \right) \\ & = 7 \cdot 2^2 \cdot 3 - 7 \cdot 2^3 \left( \cos \frac{2 \pi}{7} + \cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} \right) + 7 \cdot 2^2 \left( \frac{1 + \cos \frac{4 \pi}{7} }{2} + \frac{1 + \cos \frac{8 \pi}{7} }{2} + \frac{1 + \cos \frac{12 \pi}{7} }{2} \right) \\ & = 7 \cdot 2^2 \cdot 3 - 7 \cdot 2^3 \left( \cos \frac{2 \pi}{7} + \cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} \right) + 7 \cdot 2 \cdot 3 + 7 \cdot 2 \left( \cos \frac{4 \pi}{7} + \cos \frac{8 \pi}{7} + \cos \frac{12 \pi}{7} \right) \\ & = 7 \cdot 2^2 \cdot 3 - 7 \cdot 2^3 \left( \cos \frac{2 \pi}{7} + \cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} \right) + 7 \cdot 2 \cdot 3 + 7 \cdot 2 \left( \cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} + \cos \frac{2 \pi}{7} \right) \\ & = 7 \cdot 2 \cdot 3 \left( 2 + 1 \right) - 7 \cdot 2 \left( 4 - 1 \right) \left( \cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} + \cos \frac{2 \pi}{7} \right) \\ & = 7 \cdot 2 \cdot 3 \left( 2 + 1 \right) - 7 \cdot 2 \left( 4 - 1 \right) \cdot \left( - \frac{1}{2} \right) \\ & = \boxed{\textbf{(C) }147}, \end{align*}
$$

where the second from the last equality follows from the property that
 $$\cos \frac{4 \pi}{7} + \cos \frac{6 \pi}{7} + \cos \frac{2 \pi}{7} = - \frac{1}{2} .$$

For explanation see [https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_24#Supplement_.28Explanation_to_Why_cos.282.CF.80.2F7.29_.2B_cos.284.CF.80.2F7.29_.2B_cos.286.CF.80.2F7.29_.3D_-1.2F2.29 supplement].

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 3 (Complex Numbers and Trigonometry)
As explained in Solutions 1 and 2, what we are trying to find is 7 $\cdot 2^4 \sin^4 \frac{\pi}{7} + 7 \cdot 2^4 \sin^4 \frac{2 \pi}{7} + 7 \cdot 2^4 \sin^4 \frac{3 \pi}{7}.$ Using trig we get

$$
\begin{align*} & \sin^4 \frac{\pi}{7} + \sin^4 \frac{2 \pi}{7} + \sin^4 \frac{3 \pi}{7} \\ = & \sin^2 \frac{\pi}{7} \left(1 - \cos^2 \frac{\pi}{7} \right) + \sin^2 \frac{2\pi}{7} \left(1 - \cos^2 \frac{2\pi}{7} \right) + \sin^2 \frac{3\pi}{7} \left(1 - \cos^2 \frac{3\pi}{7} \right) \\ = & \sin^2 \frac{\pi}{7} - \left(\frac{1}{2} \sin \frac{2\pi}{7}\right)^2 + \sin^2 \frac{2\pi}{7} - \left(\frac{1}{2} \sin \frac{4\pi}{7}\right)^2 + \sin^2 \frac{3\pi}{7} - \left(\frac{1}{2} \sin \frac{6\pi}{7}\right)^2\\ = & \sin^2 \frac{\pi}{7} - \frac{1}{4} \sin^2 \frac{2\pi}{7} + \sin^2 \frac{2\pi}{7} - \frac{1}{4} \sin^2 \frac{4\pi}{7} + \sin^2 \frac{3\pi}{7} - \frac{1}{4} \sin^2 \frac{6\pi}{7} \\ = & \frac{3}{4} \left(\sin^2 \frac{\pi}{7} + \sin^2 \frac{2\pi}{7} + \sin^2 \frac{3\pi}{7}\right) \\ = & \frac{3}{4} \cdot \frac{1}{2} \left(1 - \cos \frac{2\pi}{7} + 1 - \cos \frac{4\pi}{7} + 1 - \cos \frac{6\pi}{7} \right)\\ = & \frac{3}{4} \cdot \frac{1}{2} \left(3 - \left(-\frac{1}{2}\right)\right) \\ = & \frac{21}{16}. \end{align*}
$$

Like in the second solution, we also use the fact that $\cos \frac{2\pi}{7} + \cos \frac{4\pi}{7} + \cos \frac{6\pi}{7} = -\frac{1}{2},$ which admittedly might need some explanation.

For explanation see [https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_24#Supplement_.28Explanation_to_Why_cos.282.CF.80.2F7.29_.2B_cos.284.CF.80.2F7.29_.2B_cos.286.CF.80.2F7.29_.3D_-1.2F2.29 supplement].

Notice that

$$
\begin{align*} \cos \frac{2\pi}{7} + \cos \frac{4\pi}{7} + \cos \frac{6\pi}{7} & = \frac{1}{2}\left(e^\frac{2i\pi}{7}+ e^{-\frac{2i\pi}{7}} \right) + \frac{1}{2}\left( e^\frac{4i\pi}{7}+ e^{-\frac{4i\pi}{7}} \right) + \frac{1}{2}\left( e^\frac{6i\pi}{7}+ e^{-\frac{6i\pi}{7}}\right) \\ & = \frac{1}{2}\left(e^\frac{2i\pi}{7}+ e^{-\frac{2i\pi}{7}}+ e^\frac{4i\pi}{7}+ e^{-\frac{4i\pi}{7}} +e^\frac{6i\pi}{7}+ e^{-\frac{6i\pi}{7}} + 1\right) - \frac{1}{2} \end{align*}
$$

In the brackets we have the sum of the roots of the polynomial $x^7 - 1 = 0$. These sum to 0 by [Vieta’s formulas](https://artofproblemsolving.com/wiki/index.php/Vieta’s_formulas), and the desired identity follows. See [Roots of unity](https://artofproblemsolving.com/wiki/index.php/Roots_of_unity) if you have not seen this technique.

Going back to the question: 7 $\cdot 2^4 \sin^4 \frac{\pi}{7} + 7 \cdot 2^4 \sin^4 \frac{2 \pi}{7} + 7 \cdot 2^4 \sin^4 \frac{3 \pi}{7} = 7 \cdot 2^4 \left(\sin^4 \frac{\pi}{7} + \sin^4 \frac{2 \pi}{7} + \sin^4 \frac{3 \pi}{7}\right) = 7 \cdot 2^4 \cdot \frac{21}{16} = \boxed{\textbf{(C) }147}.$
*~obscene_kangaroo*
## Solution 4 (Trigonometry)
This solution follows the same steps as the trigonometry solutions (Solutions 2 and 3), except it gives an alternate way to prove the statement below true without complex numbers:

$$\cos \frac{2\pi}{7} + \cos \frac{4\pi}{7} + \cos \frac{6\pi}{7} = -\frac{1}{2}$$


$$
\begin{align*} S &= \cos \frac{2\pi}{7} + \cos \frac{4\pi}{7} + \cos \frac{6\pi}{7}, \\ S^2 &= \cos^2 \frac{2\pi}{7} + \cos^2 \frac{4\pi}{7} + \cos^2 \frac{6\pi}{7} + 2\cos \frac{2\pi}{7}\cos \frac{4\pi}{7} + 2\cos \frac{2\pi}{7}\cos \frac{6\pi}{7} + 2\cos \frac{4\pi}{7}\cos \frac{6\pi}{7} \\ &= \left(\frac{1+ \cos \frac{4\pi}{7}}{2}\right) + \left(\frac{1+ \cos \frac{8\pi}{7}}{2}\right) + \left(\frac{1+ \cos \frac{12\pi}{7}}{2}\right) + 2\cos \frac{2\pi}{7}\cos \frac{4\pi}{7} + 2\cos \frac{2\pi}{7}\cos \frac{6\pi}{7} + 2\cos \frac{4\pi}{7}\cos \frac{6\pi}{7} \\ &= \frac{1}{2}(3 + S) + \left(\cos \frac{6\pi}{7} + \cos \frac{2\pi}{7}\right) + \left(\cos \frac{8\pi}{7} + \cos \frac{4\pi}{7}\right) + \left(\cos \frac{10\pi}{7} + \cos \frac{2\pi}{7}\right) \\ &= \frac{1}{2}(3 + S) + 2\cos \frac{2\pi}{7} + 2\cos \frac{4\pi}{7} + 2\cos \frac{6\pi}{7}\\ &= \frac{1}{2}(3 + S) + 2S. \\ \end{align*}
$$

We end up with $2S^2 - 5S - 3 = 0.$
Using the quadratic formula, we find the solutions for S to be $-\frac{1}{2}$ and 3. Because 3 is impossible, S = $-\frac{1}{2}.$
With this result, following similar to steps to Solutions 2 and 3 will get $\boxed{\textbf{(C) }147}$

*~lordf*
## Solution 5 (Law of Cosines)
Let x, y, and z be the lengths of the chords with arcs $\frac{2\pi}{7}, \frac{4\pi}{7}$ and $\frac{6\pi}{7}$ respectively.

Then by the law of cosines we get:

$$
\begin{align*} x^2 &= 2\left(1-\cos\frac{2\pi}{7}\right), \\ y^2 &= 2\left(1-\cos\frac{4\pi}{7}\right), \\ z^2 &= 2\left(1-\cos\frac{6\pi}{7}\right). \end{align*}
$$

The answer is then just $7(x^4+y^4+z^4)$ (since there's 7 of each diagonal/side), obtained by summing the squares of the above equations and then multiplying by 7.

$$
\begin{align*} & \quad7\cdot2^2\left( \left(1-\cos\frac{2\pi}{7}\right)^2 + \left(1-\cos\frac{4\pi}{7}\right)^2 + \left(1-\cos\frac{6\pi}{7}\right)^2 \right) \\ &= 7\cdot4\left( \left(1-2\cos\frac{2\pi}{7}+\cos^2\frac{2\pi}{7}\right) + \left(1-2\cos\frac{4\pi}{7}+\cos^2\frac{4\pi}{7}\right) + \left(1-2\cos\frac{6\pi}{7}+\cos^2\frac{6\pi}{7}\right) \right) \\ &= 7\cdot4\left(3-2\left(\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}\right) + \left(\cos^2\frac{2\pi}{7}+\cos^2\frac{4\pi}{7}+\cos^2\frac{6\pi}{7}\right) \right) \\ &= 7\cdot4\left(3-2\left(\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}\right) + \frac12 \left(1+\cos\frac{4\pi}{7}+1+\cos\frac{8\pi}{7}+1+\cos\frac{12\pi}{7}\right) \right) \\ &= 7\cdot4\left(\frac{9}{2}-2\left(\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}\right) + \frac12 \left(\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}+\cos\frac{2\pi}{7}\right) \right) \\ &= 7\cdot4\left(\frac{9}{2}-\frac{3}{2}\left(\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}\right) \right) \\ &= 7\cdot4\left(\frac{9}{2}-\frac{3}{2}\left(-\frac{1}{2}\right)\right) \\ &= \boxed{\textbf{(C) }147}. \end{align*}
$$


(Use the identity that  $\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7} = -\frac{1}{2}.)$

For explanation of this identity see [https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_24#Supplement_.28Explanation_to_Why_cos.282.CF.80.2F7.29_.2B_cos.284.CF.80.2F7.29_.2B_cos.286.CF.80.2F7.29_.3D_-1.2F2.29 supplement].

- SAHANWIJETUNGA
## Solution 6 (Ruler Measure)
Hope you had a ruler handy! This problem can be done with a ruler and basic estimation.

First, measuring the radius of the circle obtains 2.9 cm (when done on the paper version). Thus, any other measurement we get for the sides/diagonals should be divided by 2.9.

Measuring the sides of the circle gets 2.5 cm. The shorter diagonals are 4.5 cm, and the longest diagonals measure 5.6 cm. Thus, we'd like to estimate $7\left(\frac{2.5}{2.9}\right)^4 + 7\left(\frac{4.5}{2.9}\right)^4 + 7\left(\frac{5.6}{2.9}\right)^4.$

We know $\left(\frac{2.5}{2.9}\right)^4$ is slightly less than 1. Let's approximate it as 1 for now. Thus, $7\left(\frac{2.5}{2.9}\right)^4 \approx 7.$

Next, $\left(\frac{4.5}{2.9}\right)^4$ is slightly more than $\left(\frac{4.5}{3}\right)^4.$ We know $\left(\frac{4.5}{3}\right)^4 = 1.5^4 = \frac{81}{16},$ slightly more than 5, so we can approximate $\left(\frac{4.5}{2.9}\right)^4$ as 5.5. Thus, $7\left(\frac{4.5}{2.9}\right)^4 \approx 38.5.$

Finally, $\left(\frac{5.6}{2.9}\right)^4$ is slightly less than $\left(\frac{5.6}{2.8}\right)^4 = 2^4 = 16.$ We say it's around 15, so then $7\left(\frac{5.6}{2.9}\right)^4 \approx 105.$

Adding what we have, we get 105 + 38.$5 + 1 = 144$.5 as our estimate. We see $\boxed{\textbf{(C) }147}$ is very close to our estimate, so we have successfully finished the problem.

*~sirswagger21*
## Solution 7 (Pythagorean Theorem and Trig)
First, we put the figure in the coordinate plane with the center of the circle at the origin and a vertex on the positive x-axis. Thus, the coordinates of the vertices will be the terminal points of integer multiples of the angle $\frac{2\pi}{7},$ which are $\left(\cos\dfrac{2\pi n}{7}, \sin\dfrac{2\pi n}{7}\right)$ for integer n. Then, we notice there are three types of diagonals: the ones with chords of arcs $\dfrac{2\pi}{7}, \dfrac{4\pi}{7},$ and $\dfrac{6\pi}{7}.$ We notive there are here are 7 of each type of diagonal. Then, we use the [pythagorean theorem](https://artofproblemsolving.com/wiki/index.php/pythagorean_theorem) to find the distance from $\left(\cos\frac{2\pi n}{7}, \sin\frac{2\pi n}{7}\right)$ to (1, 0):

$$
\left(\sqrt{\left(\cos\frac{2\pi n}{7}-1\right)^2+\sin^2\frac{2\pi n}{7}}\right)^4=\left(\sqrt{\cos^2\frac{2\pi n}{7}+\sin^2\frac{2\pi n}{7}-2\cos\frac{2\pi n}{7}+1}\right)^4
=\left(\sqrt{2-2\cos\frac{2\pi n}{7}}\right)^4
=4\cos^2\frac{2\pi n}{7}-8\cos\frac{2\pi n}{7}+4.
$$

By the cosine double angle identity, $\cos{2\theta}=2\cos^2\theta-1.$ This means that $2\cos^2\theta=\cos{2\theta}+1.$ Substituting this in,
$4\cos^2\frac{2\pi n}{7}-8\cos\frac{2\pi n}{7}+4=2\left(\cos\frac{4\pi n}{7}+1\right)-8\cos\frac{2\pi n}{7}+4=2\cos\frac{4\pi n}{7}-8\cos\frac{2\pi n}{7}+6.$ Summing this up for n=1,2,3,

$$
2\cos\frac{4\pi}{7}-8\cos\frac{2\pi}{7}+6+2\cos\frac{8\pi}{7}-8\cos\frac{4\pi}{7}+6+2\cos\frac{12\pi}{7}-8\cos\frac{6\pi}{7}+6 =2\left(\cos\frac{4\pi}{7}+\cos\frac{8\pi}{7}+\cos\frac{12\pi}{7}\right)-8\left(\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}\right)+18
=2\left(\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}+\cos\frac{2\pi}{7}\right)-8\left(\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}\right)+18
=2(-0.5)-8(-0.5)+18=21.
$$

(These equalities are based on $\cos\theta=\cos(2\pi-\theta)$ and $\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}=-\frac{1}{2}.) ($For explanation of this see [https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_24#Supplement_.28Explanation_to_Why_cos.282.CF.80.2F7.29_.2B_cos.284.CF.80.2F7.29_.2B_cos.286.CF.80.2F7.29_.3D_-1.2F2.29 supplement].)
Finally, because there are 7 of each type of diagonal, the answer is $7\cdot 21=\boxed{147}.$

~[BS2012](https://artofproblemsolving.com/wiki/index.php/BS2012)
## Solution 8 (Roots of Unity)
Place the figure on the complex plane and let w = $e^{\frac{2\pi}{7}}$ (a 7th root of unity). The vertices of the 7-gon are $w^0,w^1,w^2,\dots,w^6.$ We wish to find

$$\sum_{i=0}^5\sum_{j=i+1}^6\lvert w^i-w^j\rvert^4 = \frac{1}{2}\sum_{i=0}^6\sum_{j=0}^6\lvert w^i-w^j\rvert^4.$$

The second expression is more convenient to work with. The factor of $\tfrac{1}{2}$ is because it double-counts each edge (and includes when i=j, but the length is 0 so it doesn't matter).

Recall the identity |z|$^2 =z\overline{z}.$ Since |w| = 1, $\overline{w} =w^{-1}$, and

$$
\begin{align*} \lvert w^i-w^j\rvert^4 &= ((w^i-w^j)(w^{-i}-w^{-j}))^2 \\ &= (2-w^{i-j}-w^{j-i})^2 \\ &= 4+w^{2i-2j}+w^{2j-2i}+2(-2w^{i-j}-2w^{j-i}+1) \\ &= 6-4w^{i-j}-4w^{j-i}+w^{2i-2j}+w^{2j-2i}. \end{align*}
$$


But notice that, for a fixed value of i, over all values of j from 0 to 6, by properties of modular arithmetic with w^7 = w^0 (or expanding),
each of the $w^$\bullet-terms takes on every value $in w^0,w^1,w^2,\dots,w^6$ exactly once. Since $\sum_{j=0}^6 w^j = 0$,

$$
\begin{align*} \frac{1}{2}\sum_{i=0}^6\sum_{j=0}^6\lvert w^i-w^j\rvert^4 &= \frac{1}{2}\sum_{i=0}^6\sum_{j=0}^6(6-4w^{i-j}-4w^{j-i}+w^{2i-2j}+w^{2j-2i}) \\ &= \frac{1}{2}\sum_{i=0}^6\left(\sum_{j=0}^6 6-4\sum_{j=0}^6 w^{i-j}-4\sum_{j=0}^6 w^{j-i}+\sum_{j=0}^6 w^{2i-2j}+\sum_{j=0}^6 w^{2j-2i}\right) \\ &= \frac{1}{2}\sum_{i=0}^6\left(\sum_{j=0}^6 6-4\sum_{j=0}^6 w^j-4\sum_{j=0}^6 w^j+\sum_{j=0}^6 w^j+\sum_{j=0}^6 w^j\right) \\ &= \frac{1}{2}\sum_{i=0}^6\sum_{j=0}^6 6 \\ &= \frac{1}{2}\cdot7\cdot7\cdot6 \\ &= \boxed{\textbf{(C) }147}. \end{align*}
$$


Fun fact: This generalizes to any regular n-gon with n $\ge 3$ to obtain
$$\frac{1}{2}\sum_{i=0}^{n-1}\sum_{j=0}^{n-1}6 = 3n^2,$$
though for even n, $w^{2i-2j}$ and $w^{2j-2i}$ take on every value $in w^0,w^2,w^4,\dots,w^{n-2}$ exactly twice. These are the $\tfrac{n}{2}$th roots of unity, so they still sum to 0.

This also explains why n < 3 doesn't follow the pattern. For $n = 2$ (one edge of length 2), since $w^{2i-2j}$ = ($w^2)^{i-j}=1^{i-j} = 1$ and similarly for $w^{2j-2i}$, the constant term in the summation becomes 8 instead of 6. For $n = 1$ (no edges), the constant term becomes 0.

*~maxamc*

*~edited by emerald_block*
## Solution 9 (Inductive Reasoning)
This is how I solve this problem:

It's easy to solve for 3-gon, 4-gon, and 6-gon inscribed in a unit circle. (Okay, it's just the weird names for triangle, square, and hexagon)

For 3-gon, the sum is equal to 3 times the 4th power of an edge. Thus, $S_3=$3\,$\cdot$\,$\left(\sqrt{3}\right)^4=27.$

For 4-gon, the sum is equal to 4 times the 4th power of an edge, and 2 times the 4th power of the diagonal. Thus, $S_4=$4\,$\cdot$\,$\left(\sqrt{2}\right)^4+$2\,$\cdot$\,$\left(2\right)^4=48.$

For 6-gon, the sum is equal to 6 times the 4th power of an edge, 6 times the 4th power of the short diagonal, and 3 times the 4th power of the long diagonal. Thus, $S_6=$6\,$\cdot$\,$\left(1\right)^4+$6\,$\cdot$\,$\left(\sqrt{3}\right)^4+$3\,$\cdot$\,$\left(2\right)^4=108.$

Then, I quickly noticed that 27=3\,$\cdot$\$,3^2, 48=$3\,$\cdot$\$,4^2,$ and 108=3\,$\cdot$\$,6^2.$ So reasonably, it will work out this formula, $S_n=3$n^2. (This step is purely out of guessing, maybe have a look at Solution 8 for more info...)

By inductive reasoning, we got $S_7=$3\,$\cdot$\,$7^2=\boxed{\textbf{(C) }147}.$

- Prof. Joker
## Solution 10 (cheese)
There are 7 segments with length $2\sin{\frac{\pi}{7}}, 7$ segments with length $2\sin{\frac{2\pi}{7}},$ and 7 segments with length $2\sin{\frac{3\pi}{7}}.$ The sum is 112($\sin^4\frac{\pi}{7}+\sin^4\frac{2\pi}{7}+\sin^4\frac{3\pi}{7})$ Note that $\frac{3}{7} = 0.425871...,$ so $\sin\frac{3\pi}{7} \approx \sin\frac{\pi}{2},$ but a little less (The actual value is approximately 0.975), and based on the answer choices, we can conclude that our answer will be a little greater than 1, so we make the educated guess of $\boxed{\textbf{(C) }147}$

## Supplement (Explanation of why cos(2π/7) + cos(4π/7) + cos(6π/7) = -1/2)
The sum of all roots of unity is 0, therefore, the sum of the real parts of the roots of unity is 0.

Consider the roots of unity of $x^n-1=0$ where n is odd on the unit circle, the cosine (real parts) of all the roots under the x-axis is the same as the cosine of all the roots above the x-axis because of symmetry. Hence, 2 times the sum of the cosines of all the roots above the x-axis plus 1 is 0.

In the context of this problem, $2($\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7}) + $1 = 0.$ Hence, $\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{6\pi}{7} = -\frac{1}{2}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solution
https://youtu.be/nO5p_xfXykI

*~ThePuzzlr*

https://youtu.be/yRbweIYtLU8

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
