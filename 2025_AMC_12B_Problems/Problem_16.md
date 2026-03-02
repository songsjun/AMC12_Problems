# 2025 AMC 12B Problem 16

## Problem
An analog clock starts at midnight and runs for 2025 minutes before stopping. What is the tangent of the acute angle between the hour hand and the minute hand when the clock stops?

$\textbf{(A) } 0 \qquad \textbf{(B) } \sqrt{2}-1 \qquad \textbf{(C) } 2-\sqrt{2} \qquad \textbf{(D) } \frac{\sqrt{2}}{2} \qquad \textbf{(E) } 3-\sqrt{2}$
## Solution 1
When divided by 60, 2025 yields 33, with a remainder of 45. Since 33 $\equiv 9 \pmod{24},$ the clock is now at 9:45.

At this time, the hour is 75\% over, so the hour hand is also 75\% of the way between 9 and 10. There are $360/12 = 30 ^\circ$ degrees between 9 and 10, and since the hour hand is 75\% of the way, it is $30^\circ \cdot \frac{3}{4} = \frac{45}{2}^\circ$ from the minute hand, which is pointing directly at 9.

We now just need to find $\tan{(45/2)}.$ Let this be x. Using the tangent addition formula, we get that

$$
\tan{45} = \frac{x + x}{1 - x\cdot x}
1 = \frac{2x}{1-x^2}
x^2+2x-1 = 0.
$$

Using the Quadratic Formula, and knowing x must be positive since 0 < x < 90, we get $x =\tan{(45/2)}= \boxed{\sqrt{2}-1}$

*~lprado*

Note: One could solve this quickly using the *tangent half angle identity*, which is $\tan(\frac{\theta}{2}) = \frac{\sin(\theta)}{1+\cos(\theta)} = \frac{1-\cos(\theta)}{\sin(\theta)}$ ~math660

Note: Another interesting way to find the angle between the hands at 9:45 is to use the formula $30h-\frac{11}{2}$m, where h is the hour and m is the minute. In this case, we get the angle is 30 $\cdot 9 - \frac{11}{2}(45) = \frac{540-495}{2} = \frac{45}{2}$ as desired. ~lprado
## Solution 2 (Sin-Cos Angle Addition)
The closest multiple of 60 to 2025 is 60 $\cdot 33 = 1980. 33,$ when divided by 12, leaves remainder 9, thus clock depicts hour 9. $2025 - 1980 = 45$ minutes, so time is 9:45. An hour has 60 minutes where $\frac{45}{60} = 0.75,$ or 0.75 past the 9th hour.

The angle between two successive hours are $\frac{360^{\circ}}{12} = 30^{\circ},$ so 45 minutes would involve $0.75\cdot 30^{\circ} = 22.5^{\circ}.$ Since double $22.5^{\circ}$ is $45^{\circ}$, we can use sine and cosine double angle (or addition) identities:


$$\sin(2 \theta)=\sin(\theta)\cdot\cos(\theta)+\sin(\theta)\cdot\cos(\theta)=2 \sin(\theta)\cos(\theta)$$

and

$$\cos(2 \theta)=\cos(\theta)\cdot\cos(\theta)-\sin(\theta)\cdot\sin(\theta)=\cos^2(\theta)-\sin^2(\theta)$$


Notice by dividing $\cos(2 \theta)$ by $\sin(2 \theta),$ the denominator and numerator cancel a trig function, so we get...


$$
\frac{\cos(2 \theta)}{\sin(2 \theta)} = \frac{\cos^2(\theta)-\sin^2(\theta)}{2 \sin(\theta)\cos(\theta)}
\frac{2}{\tan(2 \theta)} = \frac{\cos(\theta)}{\sin(\theta)} - \frac{\sin(\theta)}{\cos(\theta)}
$$


Recall $\theta = 22.5^{\circ}$ and $\tan(45^{\circ}) = 1...$

$$2 = \frac{1}{\tan(22.5^{\circ})} - \tan(22.5^{\circ})$$

Let x = $\tan(22.5^{\circ})...$

$$
2x = 1 - x^2
x^2 + 2x - 1 = 0
$$

With the quadratic formula we get:
$$x = \frac{-2\pm\sqrt{4+4}}{2}=\pm\sqrt{2} - 1$$
For x>0 since $0^{\circ}<22.5^{\circ}<90$, thus we obtain $\boxed{\textbf{(B) } \sqrt{2}-1}$

*~tebby*
## Solution 3 (Root Approximation, no trig angle identities)
Following from solutions 1 and 2, we get the time to be 9:45 and the angle to be $22.5^{\circ}$.

We know that the angle between the hour and minute hand follows the relationship $22.5^{\circ}<30^{\circ}$ and thus $\tan(22.5^{\circ}) < \tan(30^{\circ}),$ where $\tan(30^{\circ}) = \frac{\sin(30^{\circ})}{\cos(30^{\circ})} = \frac{\frac{1}{2}}{\frac{\sqrt{3}}{2}} = \frac{1}{\sqrt{3}}.$

Thus we can find an answer choice that is less than $\frac{1}{\sqrt{3}}.$ We know that $\textbf{(A)}$ is wrong since $\tan(22.5^{\circ})\ne 0.$ The other options involve $\sqrt{2}$ which we can approximate with Babylonian Method:
$$x_{n+1} = \frac{x_n + \frac{S}{x_n}}{2}$$
for $x_{n}$ is the guess for $\sqrt{S}$ and $x_{n+1}$ would be the next approximated guess. As such, $\sqrt{2} \approx \frac{1+\frac{2}{1}}{2} = 1.5$ or if you memorized the value then you can take $\sqrt{2} \approx 1.414.$ For $\sqrt{3}$ the approximation would be $\sqrt{3} \approx \frac{2+\frac{3}{2}}{2} = 1.75.$ So, $\tan(30^{\circ}) = \frac{1}{\sqrt{3}} \approx \frac{1}{1.75} = \frac{4}{7} \approx 0.571.$ Using these values we can check for the approximations for every answer choice:

$\textbf{(B) } \sqrt{2}-1 \approx 1.414 - 1 = 0.414$
$\textbf{(C) } 2-\sqrt{2} \approx 2 - 1.414 = 0.586$
$\textbf{(D) } \frac{\sqrt{2}}{2} \approx \frac{1.414}{2} = 0.707$
$\textbf{(E) } 3-\sqrt{2} \approx 3 - 1.414 = 1.586$

As seen above, only $\textbf{(B)}$ satisfies the criteria such that the answer is less than 0.571 and not equal to 0. (Even though $\textbf{(C)}$ may seem to work with $\sqrt{2}\approx 1.5$ approximation, we know that geometrically $\tan(22.5^{\circ})$ is noticeably different from $\tan(30^{\circ})$ so such close values won't be correct)

Thus, $\boxed{\textbf{(B) } \sqrt{2}-1}.$

*~tebby*
## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=FdSkJ-LiZh4
*~Pi Academy*
## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=22awgqmL2GA
## See Also
